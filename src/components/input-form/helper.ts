export type OptionType<T = never> = { text: string; value: T };

export type InputType<T> =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'email'
  | { type: 'select'; options: Array<OptionType<T>>; multiple?: boolean };

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
};

export type InputItem<T, K extends keyof T = keyof T> = InputItemPart<T, K> & {
  valueObject: T;
};

export function makeInputItems<T>(
  valueObject: T,
  items: Array<'br' | InputItemPart<T>>,
): Array<'br' | InputItem<T>> {
  return items.map(item => {
    if (item === 'br') {
      return item;
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
  switch (type) {
    case 'number':
      return target.valueAsNumber as any;
    case 'date':
      console.log('date value:', target.valueAsDate);
      break;
    case 'text':
    case 'email':
    case 'textarea':
    case undefined:
      return target.value as any;
    default:
      // enum options, use radio or checkbox
      if (!!type && type.type === 'select') {
        return target.value as any;
      }
      console.error('unknown type:', type);
  }
}
