import { h } from '@stencil/core';
import { VNode } from '@stencil/core/internal/stencil-core';
import { isVNode, Style } from './json-common';

export type PrecisionType =
  | 'minutes'
  | 'seconds'
  | 'milliseconds'
  ;
export let editor = {
  precision: 'minutes' as PrecisionType,
};

export function isDateTimeSupported(): boolean {
  const input = document.createElement('input');
  const value = 'a';
  input.setAttribute('type', 'datetime-local');
  input.setAttribute('value', value);
  return (input.value !== value);
}

function d2(x: number): string {
  if (x < 10) {
    return '0' + x;
  }
  return x.toString();
}

function d3(x: number): string {
  if (x < 10) {
    return '0' + x;
  }
  if (x < 100) {
    return '00' + x;
  }
  return x.toString();
}

// input[type=date].value string format in local timezone
function dateString(date: Date): string {
  return `${date.getFullYear()}-${d2(date.getMonth() + 1)}-${d2(date.getDate())}`;
}

// input[type=time].value string format in local timezone
function timeString(date: Date): string {
  let timeStr = `${d2(date.getHours())}:${d2(date.getMinutes())}`;
  switch (editor.precision) {
    case 'seconds':
    case 'milliseconds':
      timeStr += ':' + d2(date.getSeconds());
      if (editor.precision === 'milliseconds') {
        timeStr += '.' + d3(date.getMilliseconds());
      }
  }
  return timeStr;
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
 * TODO config number step (int or float)
 *
 * TODO support to change data type (e.g. from null or undefined to array)
 *
 * TODO support to add/delete element (e.g. for Map, Set, Array, Object)
 *
 * */
export const JsonEdit = (props: {

  /* same as JsonView */

  class?: string
  hidden?: boolean
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

  function date(time: Date, update: (ev: Event, value: Date | null) => void) {
    if ('custom') {
      // in local timezone
      // let year: number = time.getFullYear();
      // let month: number = time.getMonth() + 1;
      // let date: number = time.getDate();
      // let hours: number = time.getHours();
      // let minutes: number = time.getMinutes();
      // let seconds: number = time.getSeconds();
      // let ms: number = time.getMilliseconds();
      const dateStr = dateString(time);
      const timeStr = timeString(time);
      return [
        <input
          name={props.name}
          type={'date'}
          value={dateStr}
          onChange={ev => {
            const value = (ev.target as HTMLInputElement).value;
            if (value) {
              time = new Date(value + ' ' + timeStr);
            } else {
              // not date but still has time
              const input = document.createElement('input');
              input.type = 'time';
              input.value = timeStr;
              time = input.valueAsDate!;
            }
            console.log('new value:', time);
            update(ev, time);
          }}
        />,
        <input
          name={props.name}
          type={'time'}
          value={timeStr}
          onChange={ev => {
            const value = (ev.target as HTMLInputElement).value;
            if (value) {
              time = new Date(dateStr + ' ' + value);
            } else {
              // update time but still has date
              time = new Date(dateStr);
            }
            console.log('new value:', time);
            update(ev, time);
          }}
        />,
      ];
    }
    return <input
      name={props.name}
      type='datetime-local'
      value={time.toLocaleString()}
      onChange={ev => update(ev, new Date((ev.target as HTMLInputElement).valueAsNumber))}
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
          return date(new Date(data), (ev, date) => update(ev, date && date.getTime() ));
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
            <JsonEdit
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
          return <table style={props.style} class={props.class} hidden={props.hidden}>
            <tbody>{Array.from(data.entries()).map(([key, value]) => <tr>
              <td><JsonEdit
                {...props}
                data={key}
                parent={data}
                updateValue={newKey => {
                  map.delete(key);
                  map.set(newKey, value);
                }}
              /></td>
              <td>=></td>
              <td><JsonEdit
                {...props}
                data={value}
                name={key}
                parent={data}
                updateValue={value => map.set(key, value)}/></td>
            </tr>)}</tbody>
          </table>;
        }
        if (Array.isArray(data)) {
          return <ol>{data.map((x, i) => <li><JsonEdit
            {...props}
            data={x}
            parent={data}
            updateValue={value => data[i] = value}
          /></li>)}</ol>;
        }
        if (!props.preserveVNode && isVNode(data) ) {
          // TODO support inline html edit for VNode
          // return data;
        }
        return <table style={props.style} class={props.class} hidden={props.hidden}>
          <tbody>{
            Object.entries(data).map(([key, value]) => <tr>
              <td>{str(key)}</td>
              <td>:</td>
              <td><JsonEdit
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
/**
 * @deprecated rename into JsonEdit
 * */
export let EditableJsonView = JsonEdit;
