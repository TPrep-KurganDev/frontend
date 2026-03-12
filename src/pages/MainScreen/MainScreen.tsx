import styles from './MainScreen.module.scss'
import {Notification} from '../../components/Notification/Notification.tsx';
import {createExam} from '../../api/exam'
import {getUserById} from '../../api/users'
import {NotificationOut, deleteNotification} from '../../api/notifications'
import {formatNotificationTime} from '../../utils/formatNotificationTime'
import {PushNotificationButton} from '../../components/PushNotificationButton/PushNotificationButton'
import {usePushNotifications} from '../../hooks/usePushNotifications'
import {
  prefetchCreatedExamsGraph,
  prefetchNotificationsForUser,
  prefetchPinnedExamsGraph
} from '../../offline/prefetch';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect, type CSSProperties} from 'react';

const CACHE_WARMUP_STORAGE_PREFIX = 'app:cache-warmup:';

type CacheWarmupSnapshot = {
  progress: number;
  done: boolean;
  updatedAt: number;
};

function getWarmupStorageKey(userId: string | null): string {
  return `${CACHE_WARMUP_STORAGE_PREFIX}${userId}`;
}

function readPersistedWarmup(userId: string | null): CacheWarmupSnapshot {

  const raw = window.localStorage.getItem(getWarmupStorageKey(userId));
  if (!raw) {
    return {progress: 0, done: false, updatedAt: 0};
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CacheWarmupSnapshot>;
    return {
      progress: Math.max(0, Math.min(100, Number(parsed.progress ?? 0))),
      done: Boolean(parsed.done),
      updatedAt: Number(parsed.updatedAt ?? 0)
    };
  } catch {
    return {progress: 0, done: false, updatedAt: 0};
  }
}

function persistWarmup(userId: string | null, snapshot: CacheWarmupSnapshot): void {
  window.localStorage.setItem(getWarmupStorageKey(userId), JSON.stringify(snapshot));
}

export function MainScreen() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const {subscription} = usePushNotifications();
  const isOnline = useNetworkStatus();
  const userId = localStorage.getItem('userId');
  const [notifications, setNotifications] = useState<NotificationOut[]>([]);
  const [cacheWarmupProgress, setCacheWarmupProgress] = useState(() => {
    const initialUserId = localStorage.getItem('userId');
    return readPersistedWarmup(initialUserId).progress;
  });
  const [isCacheWarmupDone, setIsCacheWarmupDone] = useState(() => {
    const initialUserId = localStorage.getItem('userId');
    return readPersistedWarmup(initialUserId).done;
  });
  const createExamClick = () => {
    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }

    createExam('Новый экзамен').then((res) => {
      navigate(`/exam-cover?examId=${res.id}`)
    });
  }

  const [username, setUsername] = useState('');

  useEffect(() => {
    getUserById(userId)
      .then((resUser) => {
        setUsername(resUser.user_name);
      })
      .catch(() => undefined);
  }, [userId]);

  useEffect(() => {
    const snapshot = readPersistedWarmup(userId);
    setCacheWarmupProgress(snapshot.progress);
    setIsCacheWarmupDone(snapshot.done);
  }, [userId]);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    let cancelled = false;
    let completedTasks = 0;
    const totalTasks = 3;
    const trackProgress = !readPersistedWarmup(userId).done;
    if (trackProgress) {
      setCacheWarmupProgress((prev) => {
        const next = prev > 0 ? prev : 6;
        persistWarmup(userId, {
          progress: next,
          done: false,
          updatedAt: Date.now()
        });
        return next;
      });
    }

    const markTaskDone = () => {
      completedTasks += 1;
      const progress = Math.round((completedTasks / totalTasks) * 100);
      if (trackProgress) {
        setCacheWarmupProgress(progress);
        const done = completedTasks === totalTasks;
        persistWarmup(userId, {
          progress,
          done,
          updatedAt: Date.now()
        });

        if (done) {
          setIsCacheWarmupDone(true);
        }
      }
    };

    const tasks: Array<Promise<unknown>> = [
      prefetchCreatedExamsGraph(userId),
      prefetchPinnedExamsGraph(userId),
      prefetchNotificationsForUser().then((items) => {
        if (!cancelled) {
          setNotifications(items);
        }
      })
    ];

    tasks.forEach((task) => {
      void task
        .catch(() => undefined)
        .finally(() => {
          if (cancelled) {
            return;
          }
          markTaskDone();
        });
    });

    return () => {
      cancelled = true;
    };
  }, [isOnline, userId]);

  useEffect(() => {
    const checkExpiredNotifications = () => {
      const now = new Date().getTime();
      const delay = subscription ? 5000 : 0;

      setTick(prev => prev + 1);

      setNotifications(prev => {
        const expiredIds: number[] = [];
        const filtered = prev.filter(notification => {
          const notificationTime = new Date(notification.time + 'Z').getTime();

          if (notificationTime + delay <= now) {
            expiredIds.push(notification.id);
            return false;
          }
          return true;
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

  const handleOpenFavorites = () => {
    void prefetchPinnedExamsGraph(userId);
    navigate('/favourite-exam-list');
  };

  const handleOpenCreated = () => {
    void prefetchCreatedExamsGraph(userId);
    navigate('/exam-list');
  };
  const cacheIndicatorStyle = {
    '--cache-progress': `${cacheWarmupProgress}%`
  } as CSSProperties;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.user}>
          <img className={styles.avatar} width={43} height={43} alt=''
               src="avatar.png"/>
          <div className={styles.name}>{username}</div>
          <div
            className={styles.cacheStatus}
            title={isCacheWarmupDone ? 'Офлайн-кэш готов' : `Офлайн-кэш: ${cacheWarmupProgress}%`}
          >
            <div
              className={`${styles.cacheCircle} ${isCacheWarmupDone ? styles.cacheCircleDone : ''}`}
              style={cacheIndicatorStyle}
            >
              {isCacheWarmupDone
                ? <span className={styles.cacheDoneCheck} />
                : <span className={styles.cacheProgressLabel}>{Math.max(0, cacheWarmupProgress)}%</span>}
            </div>
          </div>
          <div>
            { !isOnline && <img src="offline.svg"/> }
          </div>
          <PushNotificationButton/>
        </div>
        <div className={styles.buttonsHeader}>
          <div className={styles.buttonHeader} onClick={handleOpenFavorites}>
            <img className={styles.imageButtonHeader} width={40} height={40} src='starActive.svg' alt=''/>
            <div className={styles.textButtonHeader}>Закреплённые</div>
          </div>
          <div className={styles.buttonHeader} onClick={handleOpenCreated}>
            <img className={styles.imageButtonHeader} src='createdTests.svg' width={38} height={38} alt=''/>
            <div className={styles.textButtonHeader}>Созданные</div>
          </div>
        </div>
      </header>
      <div className={styles.buttonsBody}>
        <div className={`${styles.buttonBody} ${styles.yellowButton} ${!isOnline ? 'disabledAction' : ''}`} onClick={createExamClick}>
          <img width={25} height={25} src='createTest.svg' alt=''/>
          <div className={styles.textButtonBody}>Создать тест</div>
        </div>
        {/*<div className={styles.buttonBody}>*/}
        {/*  <img width={30} height={30} src='findTest.svg'/>*/}
        {/*  <div className={styles.textButtonBody}>Найти тест</div>*/}
        {/*</div>*/}
      </div>
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
