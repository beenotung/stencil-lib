import { h } from '@stencil/core';
import * as d from '@stencil/core/dist/declarations';
import { getUpdateValue, InputItemOption } from './helper';

function updateItem<T>(props: {
  item: InputItemOption<T>,
  event: Event,
  value?: any
  triggerRender: () => void,
}) {
  const { item } = props;
  const value = ('value' in props)
    ? props.value // use given value
    : getUpdateValue(item.type, props.event) // extract value from event
  ;
  if (item.onChange) {
    item.onChange(value, item.valueObject[item.key]);
    requestAnimationFrame(() => props.triggerRender());
    return;
  }
  item.valueObject[item.key] = value;
  props.triggerRender();
}

function renderIonInput(label: string, input: d.VNode) {
  return (
    <ion-item>
      <ion-label position='stacked'>{label}</ion-label>
      {input}
    </ion-item>
  );
}

function renderInputItem<T>(props: {
  item: InputItemOption<T>,
  triggerRender: () => void,
}) {
  const { item, triggerRender } = props;
  const label = item.label;
  switch (item.type) {
    case 'date':
    case 'email':
    case 'number':
    case 'password':
    case 'search':
    case 'tel':
    case 'text':
    case undefined: // default is text
    case 'time':
    case 'url':
      return renderIonInput(label, <ion-input
        type={item.type || 'text'}
        placeholder={item.placeholder}
        value={item.valueObject[item.key] as any}
        onIonChange={event => updateItem({ item, event, triggerRender })}
        autoCorrect={'on'}
        autocomplete={'on'}
        autoCapitalize={'on'}
      />);
    case 'datetime':
      return renderIonInput(label, <ion-datetime
        displayFormat='D MMM YYYY'
        placeholder={item.placeholder}
        onIonChange={event => updateItem({ item, event, triggerRender })}
        min={item.min}
        max={item.max}
        value={item.valueObject[item.key] as any}
      />);
    case 'textarea':
      return renderIonInput(label, <ion-textarea
        placeholder={item.placeholder}
        value={item.valueObject[item.key] as any}
        onIonChange={event => updateItem({ item, event, triggerRender })}
        autoGrow={true}
        autoCorrect={'on'}
        autoCapitalize={'on'}
      />);
    default:
      if (!item.type) {
        console.error('unknown input type:', item.type);
        return;
      }
      // enum options, use radio or checkbox
      if ( item.type.type === 'select') {
        const{multiple, options} = item.type;
        return renderIonInput(label, <ion-select
          placeholder={item.placeholder}
          value={item.valueObject[item.key]}
          onIonChange={event => updateItem({ item, event, triggerRender })}
          multiple={multiple}
        >{options.map(option => <ion-select-option
          value={option.value}
          selected={multiple
            ? (item.valueObject[item.key] as any as any[] || []).includes(option.value)
            : item.valueObject[item.key] === option.value}
        >{option.text}</ion-select-option>)}</ion-select>);
      }
      if ( item.type.type === 'checkbox') {
        return <ion-list>
          <ion-list-header>{item.label}</ion-list-header>
          {item.type.options.map(option => <ion-item>
            <ion-checkbox
              slot='start'
              onIonChange={(event: any) => updateItem({
                item,
                event,
                value: option.value,
                triggerRender: props.triggerRender,
              })}
              checked={((item.valueObject[item.key] as any) as any[]).includes(
                option.value,
              )}
              value={option.value as any}
            />
            <ion-label>{option.text}</ion-label>
          </ion-item>)}
        </ion-list>;
      }
      if (item. type.type === 'radio') {
        return <ion-radio-group
          value={item.valueObject[item.key]}
          onIonChange={event => updateItem({ item, event, triggerRender })}
        >
          <ion-list-header>
            <ion-label>{label}</ion-label>
          </ion-list-header>
          {item.type.options.map(option => <ion-item>
            <ion-label>{option.text}</ion-label>
            <ion-radio slot='start' value={option.value}/>
          </ion-item>)}
        </ion-radio-group>;
      }
      const x: never = item.type;
      console.error('unknown input type:', x);
      return;
  }
}

export const InputItem = <T, >(props: {
  item: InputItemOption<T>,
  triggerRender: () => void,
}) => {
  return renderInputItem<T>(props);
};

export const InputList = <T, >(
  props: {
    items: Array<'br' | InputItemOption<T> | d.VNode | (d.VNode[])>,
    triggerRender: () => void,
  },
) => {
  return (
    <ion-list>
      {props.items.map(item => {
        if (item === 'br') {
          return <div/>;
        }
        if (Array.isArray(item)) {
          return item as d.VNode[];
        }
        const inputItem = item as InputItemOption<T>;
        if (typeof inputItem !== 'object') {
          // maybe string?
          return item;
        }
        if (inputItem.valueObject === undefined) {
          return item as d.VNode;
        }
        return <InputItem item={inputItem} triggerRender={props.triggerRender}/>;
      })}
    </ion-list>
  );
};
/**@deprecated*/
export const InputForm = InputList;
