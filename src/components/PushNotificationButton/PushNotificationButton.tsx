import React, {useEffect, useState} from 'react';
import {usePushNotifications} from '../../hooks/usePushNotifications';

export const PushNotificationButton: React.FC = () => {
  const {
    isSupported,
    subscription,
    userConsent,
    loading,
    requestPermission,
    subscribeAndSave,
    unsubscribe,
  } = usePushNotifications();

  const [busy, setBusy] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSubscribed(!!subscription);
  }, [subscription]);

  if (!isSupported) {
    return <div>Push-уведомления не поддерживаются</div>;
  }

  if (loading) return <div>Загрузка...</div>;

  const enable = async () => {
    setBusy(true);

    if (userConsent !== 'granted') {
      await requestPermission();
    }

    await subscribeAndSave();
    setBusy(false);
  };

  const disable = async () => {
    setBusy(true);
    await unsubscribe();
    setBusy(false);
  };

  return (
    <div>
      <button disabled={busy} onClick={isSubscribed ? disable : enable}>
        {busy ? 'Загрузка...' : isSubscribed ? 'Отключить уведомления' : 'Включить уведомления'}
      </button>

      <div>Статус: <strong>{isSubscribed ? 'включены' : 'выключены'}</strong></div>
    </div>
  );
};
