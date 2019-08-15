import { h } from '@stencil/core';
import * as d from '@stencil/core/dist/declarations';

export const IonPageDefaultProp = {
  menu: false,
  showBackButton: false,
};
export const IonPage = (
  props: {
    title: string;
    ionContentNoPadding?: boolean;
    ionContentClass?: string;
    showBackButton?: boolean;
    menu?: boolean
  },
  children: d.VNode[],
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
  return [
    <ion-header>
      <ion-toolbar color='primary'>
        <ion-buttons slot='start'>
          {!menu ? [] :
            <ion-menu-toggle>
              <ion-button>
                <ion-icon name='menu'/>
              </ion-button>
            </ion-menu-toggle>
          }
          {!showBackButton ? [] :
            <ion-button onClick={() => window.history.back()}>
              <ion-icon name='arrow-back'/>
            </ion-button>
          }
        </ion-buttons>
        <ion-title>{props.title}</ion-title>
      </ion-toolbar>
    </ion-header>,
    <ion-content class={ionContentClass}>
      {children}
      {/* this margin is only for desktop */}
      <div style={{ margin: '1rem' }}/>
    </ion-content>,
  ];
};
