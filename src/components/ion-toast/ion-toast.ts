import { toastController, ToastOptions } from '@ionic/core';

export async function showToast(options: ToastOptions) {
  options = {
    duration: 5000,
    showCloseButton: true,
    animated: true,
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
