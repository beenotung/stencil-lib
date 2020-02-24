export {
  ActionSheetButton,
  ActionSheetOptions,
} from '@ionic/core/dist/types/components/action-sheet/action-sheet-interface';
import { ActionSheetOptions } from '@ionic/core/dist/types/components/action-sheet/action-sheet-interface';

export function showActionSheet(options: ActionSheetOptions) {
  const actionSheet: HTMLIonActionSheetElement = document.createElement(
    'ion-action-sheet',
  );
  Object.assign(actionSheet, options);
  document.body.appendChild(actionSheet);
  actionSheet.present();
  return actionSheet;
}
