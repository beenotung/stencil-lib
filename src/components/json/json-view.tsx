import { h } from '@stencil/core';
import { VNode } from '@stencil/core/internal/stencil-core';
import { isVNode, Style } from './json-common';

/**
 * can be customized by consumer
 * */
export let formatter = {
  date: (date: Date) => date.toLocaleString(),
  number: (number: number) => number.toLocaleString(),
};

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
 * */
export const JsonView = (props: {
  class?: string
  hidden?: boolean
  data: any,
  name?: string
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
  preserveVNode?: boolean,
}): VNode => {
  function str(string: string) {
    return <span style={props.style}>{string}</span>;
  }

  const res: string | VNode = (() => {
    const data = props.data;
    const type = typeof data;
    switch (type) {
      case 'string':
        return data;
      case 'number': {
        const name = (props.name || '').toLocaleLowerCase();
        if (name.includes('time') || name.includes('date')) {
          return formatter.date(new Date(data));
        }
        return formatter.number(data);
      }
      case 'bigint':
        return data.toLocaleString();
      case 'boolean':
        return data ? 'yes' : 'no';
      case 'function':
        return data.toString();
      case 'symbol':
        return data.toString();
      case 'undefined':
        return 'undefined';
      case 'object':
        if (data === null) {
          return 'null';
        }
        if (data instanceof Date) {
          return formatter.date(data);
        }
        if (data instanceof Set) {
          return <ul style={props.style}>{Array.from(data).map(x => <li>
            <JsonView {...props} data={x} />
          </li>)}</ul>;
        }
        if (data instanceof Map) {
          return <table style={props.style} class={props.class} hidden={props.hidden}>
            <tbody>{Array.from(data.entries()).map(([key, value]) => <tr>
              <td><JsonView {...props} data={key} /></td>
              <td>=></td>
              <td><JsonView {...props} data={value} name={key} /></td>
            </tr>)}</tbody>
          </table>;
        }
        if (Array.isArray(data)) {
          return <ol style={props.style}>{data.map(x => <li>
            <JsonView {...props} data={x} />
          </li>)}</ol>;
        }
        if (!props.preserveVNode && isVNode(data) ) {
          if (props.overrideStyle) {
            if (!data.$attrs$) {
              data.$attrs$ = {};
            }
            if (!data.$attrs$.style) {
              data.$attrs$.style = {};
            }
            Object.assign(data.$attrs$.style, props.style);
          }
          return data;
        }
        return <table style={props.style} class={props.class} hidden={props.hidden}> {
          Object.entries(data).map(([key, value]) => <tr>
            <td>{str(key)}:</td>
            <td><JsonView {...props} data={value} name={key} /></td>
          </tr>)
        }</table>;
      default: {
        const x: never = type;
        console.error('unknown data type:', x);
        return JSON.stringify(x);
      }
    }
  })();
  return typeof res === 'string' ? str(res) : res;
};

