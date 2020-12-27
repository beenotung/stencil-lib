import { toastController, ToastOptions } from '@ionic/core';

export async function showToast(options: ToastOptions) {
  options = {
    ...showToast.defaultOptions,
    ...options,
  };
  try {
    const toast = await toastController.create(options);
    toast.present();
  } catch (e) {
    console.error('toast web component is not supported');
    alert(options.message);
  }
}

export namespace showToast {
  export let defaultOptions: ToastOptions = {
    duration: 5000,
    showCloseButton: true,
    animated: true,
  };
}
