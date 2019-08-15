import { remove } from '@beenotung/tslib/array';
import { h } from '@stencil/core';
import * as d from '@stencil/core/dist/declarations';
import { getUpdateValue, InputItem, OptionType } from './helper';

export const InputForm = <T, >(
  props: {
    items: Array<'br' | InputItem<T>>,
    triggerRender: () => void,
  },
) => {
  const component = {

    updateItem(item: InputItem<T>, event: Event, value?: any) {
      // check if value is given
      const type = item.type || 'text';
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
      if (typeof type !== 'string' && type.type === 'select' && type.multiple) {
        const values: any[] = item.valueObject[item.key] as any;
        if (values.includes(value)) {
          remove(values, value);
        } else {
          values.push(value);
        }
      } else {
        item.valueObject[item.key] = value;
      }
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
      item: InputItem<T> & {
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

    renderInputItem(item: InputItem<T>) {
      const label = item.label;
      const type = item.type || 'text';
      switch (type) {
        case 'textarea':
          return component.renderIonInput(
            label,
            <ion-textarea
              placeholder={item.placeholder}
              value={item.valueObject[item.key] as any}
              onInput={(event: Event) => component.updateItem(item, event)}
              autoGrow={true}
              autoCorrect={'on'}
              autoCapitalize={'on'}
            />,
          );
        case 'date':
          return component.renderIonInput(
            label,
            <ion-datetime
              displayFormat='D MMM YYYY'
              placeholder={item.placeholder}
              min={item.min}
              max={item.max}
            />,
          );
        case 'text':
        case 'email':
        case 'number':
          return component.renderIonInput(
            label,
            <ion-input
              type={type}
              placeholder={item.placeholder}
              value={item.valueObject[item.key] as any}
              onInput={(event: Event) => component.updateItem(item, event)}
              autoCorrect={'on'}
              autocomplete={'on'}
              autoCapitalize={'on'}
            />,
          );
      }
      // enum options, use radio or checkbox
      if (type.type === 'select') {
        return component.renderIonInput(
          label,
          <ion-select
            placeholder={item.placeholder}
            value={item.valueObject[item.key]}
            onIonChange={(event: any) => component.updateItem(item, event)}
            multiple={type.multiple}
          >
            {type.options.map(option => (
              <ion-select-option
                value={option.value}
                selected={
                  type.multiple &&
                  (((item.valueObject[item.key] as any) as any[]) || []).includes(
                    option.value,
                  )
                }
              >
                {option.text}
              </ion-select-option>
            ))}
          </ion-select>,
        );
      }
      console.error('unknown type:', type);
      return [];
    },

    render() {
      return (
        <ion-list>
          {props.items.map(item => {
            if (item === 'br') {
              return <div/>;
            }
            return component.renderInputItem(item);
          })}
        </ion-list>
      );
    },
  };
  return component.render();
};
