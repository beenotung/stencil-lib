import { h } from '@stencil/core';
import { VNode } from '@stencil/core/internal/stencil-core';
import { ChildType } from '../../helper-types';

export const IonPageDefaultProp = {
  menu: false,
  showBackButton: false,
};
export const IonicPage = (
  props: {
    title: ChildType;
    ionContentNoPadding?: boolean;
    ionContentClass?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    menu?: boolean;
    toolbarEndButtons?: VNode | VNode[];
    hidden?: boolean;
    secondToolbar?: VNode | VNode[];
  },
  children: VNode[],
) => {
  let ionContentClass = props.ionContentClass || '';
  if (!props.ionContentNoPadding) {
    ionContentClass += ' ion-padding';
  }
  let menu = IonPageDefaultProp.menu;
  if (props.menu === false) {
    menu = false;
  }
  let showBackButton = IonPageDefaultProp.showBackButton;
  if (props.showBackButton === false) {
    showBackButton = false;
  }
  const onBack =
    props.onBack ||
    (() => {
      history.back();
    });
  return [
    <ion-header hidden={props.hidden}>
      <ion-toolbar color='primary'>
        <ion-buttons slot='start'>
          {!menu ? (
            []
          ) : (
            <ion-menu-toggle>
              <ion-button>
                <ion-icon name='menu'/>
              </ion-button>
            </ion-menu-toggle>
          )}
          {!showBackButton ? (
            []
          ) : (
            <ion-button onClick={onBack}>
              <ion-icon name='arrow-back'/>
            </ion-button>
          )}
        </ion-buttons>
        {typeof props.title === 'string' ? (
          <ion-title>{props.title}</ion-title>
        ) : (
          props.title
        )}
        {!props.toolbarEndButtons ? (
          []
        ) : (
          <ion-buttons slot='end'>{props.toolbarEndButtons}</ion-buttons>
        )}
      </ion-toolbar>
      {props.secondToolbar}
    </ion-header>,
    <ion-content class={ionContentClass} hidden={props.hidden}>
      {children}
      {/* this margin is only for desktop */}
      <div style={{ margin: '1rem' }}/>
    </ion-content>,
  ];
};
