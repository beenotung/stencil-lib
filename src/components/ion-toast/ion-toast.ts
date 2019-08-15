import { ToastOptions } from '@ionic/core';

export async function showToast(options: ToastOptions) {
  options = {
    duration: 5000,
    showCloseButton: true,
    animated: true,
    ...options,
  };
  let toastController = document.querySelector('ion-toast-controller');
  if (!toastController) {
    toastController = document.createElement('ion-toast-controller');
    document.body.appendChild(toastController);
  }
  if (!toastController.componentOnReady) {
    console.error('toast web component is not supported');
    alert(options.message);
    return;
  }
  await toastController.componentOnReady();
  const toast = await toastController.create(options);
  toast.present();
}
