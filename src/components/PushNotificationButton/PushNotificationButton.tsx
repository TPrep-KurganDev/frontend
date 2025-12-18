import React, {useEffect, useState} from 'react';
import {usePushNotifications} from '../../hooks/usePushNotifications';
import styles from './PushNotificationButton.module.scss';

export const PushNotificationButton: React.FC = () => {
  const {
    isSupported,
    subscription,
    userConsent,
    requestPermission,
    subscribeAndSave,
    unsubscribe,
  } = usePushNotifications();

  const [busy, setBusy] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bellSvg, setBellSvg] = useState('bell inactive.svg');


  useEffect(() => {
    setIsSubscribed(!!subscription);
    if (subscription){
      setBellSvg('bell active.svg')
    }
    else {
      setBellSvg('bell inactive.svg')
    }
  }, [subscription]);

  if (!isSupported) {
    return <div></div>;
  }

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

  const onBellClick = () => {
    if (busy){
      return;
    }
    isSubscribed ? disable() : enable();
  }

  return (
    <div>
      <img className={styles.bellButton} src={bellSvg} alt='' width={27} height={27} onClick={onBellClick}/>
    </div>
  );
};
