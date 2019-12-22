import { h } from '@stencil/core';
import { VNode } from '@stencil/core/dist/declarations';
import { Style, VNodeKeys } from './json-common';

export function isDateTimeSupported(): boolean {
  const input = document.createElement('input');
  const value = 'a';
  input.setAttribute('type', 'datetime-local');
  input.setAttribute('value', value);
  return (input.value !== value);
}

/**
 * supported data type:
 *   + string
 *   + number
 *   + timestamp (in number)
 *   + bigint
 *   + boolean
 *   + function
 *   + symbol
 *   + undefined
 *   + null
 *   + Date
 *   + Set
 *   + Map
 *   + Array
 *   + VNode
 *   + object
 *
 * TODO to use date and time as fallback when datetime-local is not supported
 *
 * TODO config number step (int or float)
 *
 * TODO support to change data type (e.g. from null or undefined to array)
 *
 * TODO support to add/delete element (e.g. for Map, Set, Array, Object)
 *
 * */
export const EditableJsonView = (props: {

  /* same as JsonView */

  data: any,
  name?: string
  parent?: any
  style?: Style
  /**
   * override the style on supplied VNode (in data) or not
   * */
  overrideStyle?: boolean
  /**
   * treat supplied VNode as raw json object or not
   *   if true:  will render as raw json
   *   if false: will render as VNode
   * */
  preserveVNode?: boolean

  /* update events */

  updateValue?: (value: any) => void
  onChange?: (ev: Event) => void,
}): VNode => {
  const _updateValue = props.updateValue || (value => {
    if (props.parent && props.name !== undefined) {
      props.parent[props.name] = value;
    } else {
      props.data = value;
    }
  });

  function update(ev: Event, value: any) {
    _updateValue(value);
    if (props.onChange) {
      props.onChange(ev);
    }
  }

  function str(string: string) {
    return <span style={props.style}>{string}</span>;
  }

  function date(date: Date, update: (ev: Event, value: Date | null) => void) {
    return <input
      name={props.name}
      type='datetime-local'
      value={date.toISOString()}
      onChange={ev => update(ev, (ev.target as HTMLInputElement).valueAsDate)}
    />;
  }

  const res: string | VNode = (() => {
    const data = props.data;
    const type = typeof data;
    switch (type) {
      case 'string':
        return <input
          name={props.name}
          type='text'
          value={props.data}
          onChange={ev => update(ev, (ev.target as HTMLInputElement).value)}
        />;
      case 'number': {
        const name = (props.name || '').toLocaleLowerCase();
        if (name.includes('time') || name.includes('date')) {
          return date(new Date(data), (ev, date) => update(ev, date?.getTime()));
        }
        return <input
          name={props.name}
          type='number'
          value={data}
          onChange={ev => update(ev, (ev.target as HTMLInputElement).valueAsNumber)}
        />;
      }
      case 'bigint':
        return <input
          name={props.name}
          type='text'
          value={data.toString()}
          onChange={ev => update(ev, BigInt((ev.target as HTMLInputElement).value))}
        />;
      case 'boolean':
        return <input
          name={props.name}
          type='checkbox'
          checked={data}
          onChange={ev => update(ev, (ev.target as HTMLInputElement).checked)}
        />;
      case 'function':
        return <textarea
          name={props.name}
          value={data.toString()}
          // tslint:disable-next-line:no-eval
          onChange={ev => update(ev, eval((ev.target as HTMLTextAreaElement).value))}
        />;
      case 'symbol':
        return <input
          name={props.name}
          type='text'
          value={Symbol.keyFor(data)}
          onChange={ev => update(ev, Symbol.for((ev.target as HTMLInputElement).value))}
        />;
      case 'undefined':
        // TODO afterward
        return 'undefined';
      case 'object':
        if (data === null) {
          return 'null';
        }
        if (data instanceof Date) {
          return date(data, (ev, date) => update(ev, date));
        }
        if (data instanceof Set) {
          const set = data;
          return <ul>{Array.from(data).map(x => <li>
            <EditableJsonView
              {...props}
              data={x}
              parent={data}
              updateValue={value => {
                set.delete(x);
                set.add(value);
              }}
            /></li>)}</ul>;
        }
        if (data instanceof Map) {
          const map = data;
          return <table style={props.style}>
            <tbody>{Array.from(data.entries()).map(([key, value]) => <tr>
              <td><EditableJsonView
                {...props}
                data={key}
                parent={data}
                updateValue={newKey => {
                  map.delete(key);
                  map.set(newKey, value);
                }}
              /></td>
              <td>=></td>
              <td><EditableJsonView
                {...props}
                data={value}
                name={key}
                parent={data}
                updateValue={value => map.set(key, value)}/></td>
            </tr>)}</tbody>
          </table>;
        }
        if (Array.isArray(data)) {
          return <ol>{data.map((x, i) => <li><EditableJsonView
            {...props}
            data={x}
            parent={data}
            updateValue={value => data[i] = value}
          /></li>)}</ol>;
        }
        if (!props.preserveVNode && VNodeKeys.every(key => key in data)) {
          // TODO support inline html edit for VNode
          // return data;
        }
        return <table style={props.style}>
          <tbody>{
            Object.entries(data).map(([key, value]) => <tr>
              <td>{str(key)}</td>
              <td>:</td>
              <td><EditableJsonView
                parent={data}
                name={key}
                data={value}
                style={props.style}
                onChange={props.onChange}
                updateValue={value => data[key] = value}
              /></td>
            </tr>)
          }</tbody>
        </table>;
      default: {
        const x: never = type;
        console.error('unknown data type:', x);
        return JSON.stringify(x);
      }
    }
  })();
  return typeof res === 'string' ? str(res) : res;
};
