import styles from './StartButtons.module.scss';
import {useNavigate} from 'react-router-dom';
import {ExamOut} from '../../api/exam.ts';
import {useState} from 'react';
import {RandomQuestionsModal} from '../RandomQuestionsModal/RandomQuestionsModal';
import {toast} from 'react-hot-toast';
import {createSessionOffline} from '../../api/session.ts';
import {beginPendingSessionStart} from '../../session/pendingSessionStart';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {probeBackendReachability} from '../../api/api.ts';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';
import {buildExamPath} from '../../utils/backNavigation';

type StartButtonsProps = {
  exam?: ExamOut | null;
  cardsCount?: number;
  viewQuestionsBackPage?: string;
}

export function StartButtons({exam, cardsCount = 0, viewQuestionsBackPage}: StartButtonsProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOnline = useNetworkStatus();
  const isStartDisabled = !exam?.id || cardsCount <= 0;
  const isBrowserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const isSmartDisabled = isStartDisabled || isBrowserOffline;

  const ensureCanStart = (): boolean => {
    if (isStartDisabled) {
      toast.error('Нет вопросов для прохождения');
      return false;
    }

    return true;
  };

  const startNewSession = async (exam_id: string | undefined, strategy: string, n: number | null = null) => {
    if (!ensureCanStart() || !exam_id) {
      return;
    }

    const normalizedStrategy = strategy.trim().toLowerCase();
    if (normalizedStrategy === 'smart' && isBrowserOffline) {
      notifyOnlineOnly();
      return;
    }

    const persistedReachability = typeof window !== 'undefined'
      ? window.localStorage.getItem('app:backend-reachable')
      : '1';
    let shouldStartOffline = !isOnline || persistedReachability === '0';

    if (normalizedStrategy === 'smart' && typeof navigator !== 'undefined' && navigator.onLine) {
      const reachableNow = await probeBackendReachability(450);
      if (!reachableNow) {
        notifyOnlineOnly();
        return;
      }

      shouldStartOffline = false;
    } else if (!shouldStartOffline && typeof navigator !== 'undefined' && navigator.onLine) {
      const reachableNow = await probeBackendReachability(450);
      shouldStartOffline = !reachableNow;
    }

    if (shouldStartOffline) {
      createSessionOffline({
        exam_id: exam_id,
        strategy: strategy,
        n: n
      }).then((response) => {
        navigate(`/session?sessionId=${response.id}`);
      }).catch((error: unknown) => {
        const maybeError = error as { code?: string };
        if (maybeError.code === 'OFFLINE_SMART_STRATEGY_UNAVAILABLE') {
          notifyOnlineOnly();
          return;
        }
        if (maybeError.code === 'OFFLINE_SESSION_DATA_UNAVAILABLE') {
          toast.error('Для офлайна сначала откройте вопросы этого экзамена онлайн');
          return;
        }
        toast.error('Не удалось начать прохождение');
      });
      return;
    }

    const pendingStartId = beginPendingSessionStart({
      exam_id: exam_id,
      strategy: strategy,
      n: n
    });

    navigate(`/session?pendingStart=${pendingStartId}`);
  };

  const handleRandomQuestions = (count: number) => {
    if (!Number.isFinite(count) || count < 1) {
      toast.error('Введите число от 1');
      return;
    }

    void startNewSession(exam?.id, 'random', count);
  };

  const handleViewQuestions = () => {
    if (!exam?.id) {
      return;
    }

    navigate(buildExamPath(exam?.id, viewQuestionsBackPage));
  }

  return (
    <>
      <div className={styles.firstRow}>
        <div className={`${styles.button} ${styles.yellowButton} ${isStartDisabled ? 'disabledAction' : ''}`}
             onClick={() => {
               void startNewSession(exam?.id, 'full');
             }}>
          Пройти весь тест
        </div>
        <div className={`${styles.button} ${styles.hardButton} ${isSmartDisabled ? 'disabledAction' : ''}`}
             onClick={() => {
               if (!ensureCanStart()) {
                 return;
               }
               if (isBrowserOffline) {
                 notifyOnlineOnly();
                 return;
               }
               void startNewSession(exam?.id, 'smart');
             }}>
          Умный подбор вопросов
        </div>
      </div>
      <div className={styles.secondRow}>
        <div className={`${styles.button} ${styles.grayButton} ${isStartDisabled ? 'disabledAction' : ''}`}
             onClick={() => {
               if (!ensureCanStart()) {
                 return;
               }
               setIsModalOpen(true);
             }}>
          Пройти n случайных вопросов
        </div>
        <div className={`${styles.button} ${styles.whiteButton}`}
             onClick={handleViewQuestions}>
          Просмотреть
        </div>
      </div>
      <RandomQuestionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRandomQuestions}
        maxQuestions={cardsCount}
      />
    </>
  )
}
