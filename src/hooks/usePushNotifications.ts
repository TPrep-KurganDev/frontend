import {useEffect, useState} from 'react';
import {api} from '../api/api';

interface PushNotificationState {
  isSupported: boolean;
  subscription: PushSubscription | null;
  userConsent: NotificationPermission | null;
  error: Error | null;
  loading: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    subscription: null,
    userConsent: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    if (!supported) {
      setState((s) => ({...s, loading: false}));
      return;
    }

    const init = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        const subscription = await registration.pushManager.getSubscription();
        setState((s) => ({
          ...s,
          isSupported: true,
          subscription,
          userConsent: Notification.permission,
          loading: false
        }));
      } catch (error) {
        setState((s) => ({...s, error: error as Error, loading: false}));
      }
    };

    init();
  }, []);

  const urlBase64ToUint8Array = (base64: string): Uint8Array => {
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const base64Str = padded.replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64Str);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  };

  const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const extractKeysFromSubscription = (sub: PushSubscription) => {
    const p256dh = sub.getKey?.('p256dh');
    const auth = sub.getKey?.('auth');

    if (!p256dh || !auth) throw new Error('Push subscription keys missing');

    return {
      endpoint: sub.endpoint,
      push_key: arrayBufferToBase64Url(p256dh),
      auth: arrayBufferToBase64Url(auth)
    };
  };

  const requestPermission = async () => {
    if (!state.isSupported) return;
    try {
      const permission = await Notification.requestPermission();
      setState((s) => ({...s, userConsent: permission}));
    } catch (error) {
      setState((s) => ({...s, error: error as Error}));
    }
  };

  const subscribe = async () => {
    if (!state.isSupported || state.userConsent !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapid_public_key = import.meta.env.VAPID_PUBLIC_KEY;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid_public_key)
      });

      setState((s) => ({...s, subscription}));
      return subscription;
    } catch (error) {
      setState((s) => ({...s, error: error as Error}));
      return null;
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const payload = extractKeysFromSubscription(subscription);
      await api.post('/push/register', payload);
    } catch (error) {
      setState((s) => ({...s, error: error as Error}));
    }
  };

  const subscribeAndSave = async () => {
    const sub = await subscribe();
    if (sub) await sendSubscriptionToServer(sub);
    return sub;
  };

  const unsubscribe = async () => {
    const sub = state.subscription;
    if (!sub) return;

    try {
      await sub.unsubscribe();
      await api.post('/push/unregister');
      setState((s) => ({...s, subscription: null}));
    } catch (error) {
      setState((s) => ({...s, error: error as Error}));
    }
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    subscribeAndSave,
    sendSubscriptionToServer,
    unsubscribe,
    extractKeysFromSubscription
  };
};
