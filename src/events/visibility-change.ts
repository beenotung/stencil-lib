let hidden: string;
let visibilityChange: string | undefined;
const _document = document as any;
if (typeof document.hidden !== 'undefined') {
  hidden = 'hidden';
  visibilityChange = 'visibilitychange';
} else if (typeof _document.mozHidden !== 'undefined') {
  hidden = 'mozHidden';
  visibilityChange = 'mozvisibilitychange';
} else if (typeof _document.msHidden !== 'undefined') {
  hidden = 'msHidden';
  visibilityChange = 'msvisibilitychange';
} else if (typeof _document.webkitHidden !== 'undefined') {
  hidden = 'webkitHidden';
  visibilityChange = 'webkitvisibilitychange';
} else {
  console.error('Page Visibility API not supported.');
}

export function isHidden(): boolean {
  return !!_document[hidden];
}

let listeners: Array<(hidden: boolean) => void> = [];

export function addVisibilityListener(
  listener: (hidden: boolean) => void,
): void {
  listeners.push(listener);
}

export function removeVisibilityListener(
  listener: (hidden: boolean) => void,
): void {
  listeners = listeners.filter(x => x !== listener);
}

function handleVisibilityChange() {
  const h = !!_document[hidden];
  listeners.forEach(f => f(h));
}

if (visibilityChange) {
  document.addEventListener(
    visibilityChange,
    () => handleVisibilityChange(),
    false,
  );
}
