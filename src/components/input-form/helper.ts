import * as d from '@stencil/core/internal/stencil-core';

export type OptionType<T = never> = { text: string; value: T };

/**
 * value: format
 *    date: YYYY-MM-DD
 *    time: HH:MM
 *    datetime: Date.toString() (with timezone info)
 *    number: number
 *    other: string
 * */
export type InputType<T> =
  // ion-input
  // type list see: https://ionicframework.com/docs/api/input
  | 'date'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  // ion-datetime
  | 'datetime'
  // ion-textarea
  | 'textarea'
  // ion-select
  | { type: 'select'; options: Array<OptionType<T>>; multiple?: boolean }
  // ion-checkbox
  | { type: 'checkbox'; options: Array<OptionType<T>> }
  // ion-radio-group
  | { type: 'radio'; options: Array<OptionType<T>> };

export type InputItemPart<T, K extends keyof T = keyof T> = {
  label: string;
  key: K;
  // default text
  type?: InputType<T[K]>;
  placeholder?: string;
  min?: string;
  max?: string;
  // will override default handling, i.e. will not auto update valueObject[key]
  // only implemented for checkbox group
  onChange?: (newValue: T[K], oldValue: T[K]) => void;
  readonly?: boolean;
  itemClass?: string;
};

export type InputItemOption<T, K extends keyof T = keyof T> = InputItemPart<
  T,
  K
> & {
  valueObject: T;
};
/**@deprecated renamed to InputItemOption to resolve name conflict*/
export type InputItem<T, K extends keyof T = keyof T> = InputItemOption<T, K>;

export function makeInputItems<T>(
  valueObject: T,
  items: Array<'br' | InputItemPart<T> | d.VNode | d.VNode[]>,
  options?: { readonly?: boolean },
): Array<'br' | InputItemOption<T> | d.VNode | d.VNode[]> {
  return items.map(item => {
    if (item === 'br') {
      return item;
    }
    if (Array.isArray(item)) {
      return item as d.VNode[];
    }
    const itemPart = item as InputItemPart<T>;
    if (options?.readonly) {
      itemPart.readonly = true;
    }
    if (
      typeof itemPart !== 'object' ||
      itemPart.label === undefined ||
      itemPart.key === undefined
    ) {
      return item as d.VNode;
    }
    return {
      ...item,
      valueObject,
    };
  });
}

export function getUpdateValue<T>(
  type: InputType<T> | undefined,
  event: Event,
): T | undefined {
  if (!event.target) {
    return;
  }
  const target = event.target as HTMLInputElement;
  const value = target.value;
  switch (type) {
    case 'date':
      // YYYY-MM-DD
      return value as any;
    case 'time':
      // HH:MM
      return value as any;
    case 'datetime':
      return new Date(value).getTime() as any;
    case 'number':
      return (value ? +value : undefined) as any;
    case 'email':
    case 'text':
    case undefined: // default is text
    case 'textarea':
    case 'search':
    case 'tel':
    case 'url':
    case 'password':
      return value as any;
    default:
      // enum options, use radio or checkbox
      if (
        type &&
        (type.type === 'select' ||
          type.type === 'checkbox' ||
          type.type === 'radio')
      ) {
        return value as any;
      }
      const x: never = type;
      console.error('unknown type:', x);
      return undefined;
  }
}
