import { h } from '@stencil/core';
import * as d from '@stencil/core/dist/declarations';
import { getUpdateValue, InputItem as InputItemType, OptionType } from './helper';

export const InputItem = <T, >(props: {
  item: InputItemType<T>,
  triggerRender: () => void,
}) => {
  const component = {

    updateItem(item: InputItemType<T>, event: Event, value?: any) {
      // check if value is given
      if (arguments.length !== 3) {
        // no value
        if (!event.target) {
          return;
        }
        value = getUpdateValue(item.type, event);
      }
      if (item.onChange) {
        item.onChange(value, item.valueObject[item.key]);
        requestAnimationFrame(() => props.triggerRender());
        return;
      }
      item.valueObject[item.key] = value;
      props.triggerRender();
    },

    renderIonInput(label: string, input: d.VNode) {
      return (
        <ion-item>
          <ion-label position='stacked'>{label}</ion-label>
          {input}
        </ion-item>
      );
    },

    /**@deprecated use ion-select with multiple attr instead */
    renderCheckboxGroup(
      item: InputItemType<T> & {
        type: { type: 'select'; options: Array<OptionType<T>>; multiple: true };
      },
    ) {
      return (
        <ion-list>
          <ion-list-header>{item.label}</ion-list-header>
          {...item.type.options.map(option => (
            <ion-item>
              <ion-checkbox
                slot='start'
                onIonChange={(event: any) => component.updateItem(item, event, option.value)}
                checked={((item.valueObject[item.key] as any) as any[]).includes(
                  option.value,
                )}
                value={option.value as any}
              />
              <ion-label>{option.text}</ion-label>
            </ion-item>
          ))}
        </ion-list>
      );
    },

    renderInputItem(item: InputItemType<T>) {
      const label = item.label;
      const type = item.type || 'text';
      switch (type) {
        case 'date':
        case 'email':
        case 'number':
        case 'password':
        case 'search':
        case 'tel':
        case 'text':
        case 'time':
        case 'url':
          return component.renderIonInput(label, <ion-input
            type={type}
            placeholder={item.placeholder}
            value={item.valueObject[item.key] as any}
            onIonChange={e => component.updateItem(item, e)}
            autoCorrect={'on'}
            autocomplete={'on'}
            autoCapitalize={'on'}
          />);
        case 'datetime':
          return component.renderIonInput(label, <ion-datetime
            displayFormat='D MMM YYYY'
            placeholder={item.placeholder}
            onIonChange={e => component.updateItem(item, e)}
            min={item.min}
            max={item.max}
            value={item.valueObject[item.key] as any}
          />);
        case 'textarea':
          return component.renderIonInput(label, <ion-textarea
            placeholder={item.placeholder}
            value={item.valueObject[item.key] as any}
            onIonChange={e => component.updateItem(item, e)}
            autoGrow={true}
            autoCorrect={'on'}
            autoCapitalize={'on'}
          />);
        default:
          // enum options, use radio or checkbox
          if (type && type.type === 'select') {
            return component.renderIonInput(label, <ion-select
              placeholder={item.placeholder}
              value={item.valueObject[item.key]}
              onIonChange={e => component.updateItem(item, e)}
              multiple={type.multiple}
            >{type.options.map(option => <ion-select-option
              value={option.value}
              selected={type.multiple
                ? (item.valueObject[item.key] as any as any[] || []).includes(option.value)
                : item.valueObject[item.key] === option.value}
            >{option.text}</ion-select-option>)}</ion-select>);
          }
          if (type && type.type === 'radio') {
            return <ion-radio-group
              value={item.valueObject[item.key]}
              onIonChange={e => component.updateItem(item, e)}
            >
              <ion-list-header>
                <ion-label>{label}</ion-label>
              </ion-list-header>
              {type.options.map(option => <ion-item>
                <ion-label>{option.text}</ion-label>
                <ion-radio slot='start' value={option.value}/>
              </ion-item>)}
            </ion-radio-group>;
          }
          const x: never = type;
          console.error('unknown input type:', x);
          return;
      }
    },

    render() {
      return component.renderInputItem(props.item);
    },
  };

  return component.render();
};

export const InputList = <T, >(
  props: {
    items: Array<'br' | InputItemType<T> | d.VNode | (d.VNode[])>,
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
        const inputItem = item as InputItemType<T>;
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
