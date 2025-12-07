import styles from './MainScreen.module.scss'
import {Notification} from '../../components/Notification/Notification.tsx';
import {createExam} from '../../api/exam'
import {getUserById} from '../../api/users'
import {getNotifications, NotificationOut, deleteNotification} from '../../api/notifications'
import {formatNotificationTime} from '../../utils/formatNotificationTime'
import {PushNotificationButton} from '../../components/PushNotificationButton/PushNotificationButton'
import {usePushNotifications} from '../../hooks/usePushNotifications'
import {useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';

export function MainScreen() {
  const [notifications, setNotifications] = useState<NotificationOut[]>([]);
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const { subscription } = usePushNotifications();
  const createExamClick = () => {
    createExam('Новый экзамен').then((res) => {navigate(`/exam-cover?examId=${res.id}`)});
  }

  const [username, setUsername] = useState('');

  useEffect(() => {
    getUserById(Number(localStorage.getItem('userId'))).then((res_user) => {
      setUsername(res_user.user_name);
    })
  }, [])

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  useEffect(() => {
    const checkExpiredNotifications = () => {
      const now = new Date().getTime();
      const delay = subscription ? 5000 : 0;

      setTick(prev => prev + 1);

      setNotifications(prev => {
        const expiredIds: number[] = [];
        const filtered = prev.filter(notification => {
          const notificationTime = new Date(notification.time).getTime();
          if (notificationTime + delay <= now) {
            expiredIds.push(notification.id);
            return false;
          }
          return true;
        });

        expiredIds.forEach(id => {
          deleteNotification(id);
        });

        return filtered;
      });
    };

    const interval = setInterval(checkExpiredNotifications, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [subscription]);

  useEffect(() => {
    if (!navigator.serviceWorker) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_SHOWN') {
        const notificationId = event.data?.notificationId;
        if (!notificationId) {
          return;
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        deleteNotification(notificationId);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleDeleteNotification = async (notificationId: number) => {
    await deleteNotification(notificationId);
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.user}>
          <img className={styles.avatar} width={43} height={43} src="avatar.png"/>
          <div className={styles.name}>{username}</div>
        </div>
        <div className={styles.buttonsHeader}>
          <div className={styles.buttonHeader} onClick={() => {navigate('/favourite-exam-list')}}>
            <img className={styles.imageButtonHeader} width={40} height={40} src='starActive.svg'/>
            <div className={styles.textButtonHeader}>Закреплённые</div>
          </div>
          <div className={styles.buttonHeader} onClick={() => {navigate('/exam-list')}}>
            <img className={styles.imageButtonHeader} src='createdTests.svg' width={38} height={38}/>
            <div className={styles.textButtonHeader}>Созданные</div>
          </div>
        </div>
      </header>
      <div className={styles.buttonsBody}>
        <div className={`${styles.buttonBody} ${styles.yellowButton}`} onClick={createExamClick}>
          <img width={25} height={25} src='createTest.svg'/>
          <div className={styles.textButtonBody}>Создать тест</div>
        </div>
        <div className={styles.buttonBody}>
          <img width={30} height={30} src='findTest.svg'/>
          <div className={styles.textButtonBody}>Найти тест</div>
        </div>
      </div>
      <PushNotificationButton />
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          examName={notification.exam_title}
          nextRepeat={formatNotificationTime(notification.time)}
          onDelete={() => handleDeleteNotification(notification.id)}
        />
      ))}
    </>

  );
}
