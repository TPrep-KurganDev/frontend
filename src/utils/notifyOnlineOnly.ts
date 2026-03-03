export function notifyOnlineOnly(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('app:offline-mutation-blocked'));
}
