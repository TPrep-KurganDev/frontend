import styles from './ExamCover.module.scss';

import Header from '../../components/Header/Header';
import {useEffect, useState} from 'react';
import {getExam, pinExam, unpinExam, getPinnedExams, ExamOut} from '../../api/exam';
import {useSearchParams, useNavigate, useLocation} from 'react-router-dom';
import {getCardsList} from '../../api/cards';
import {AppRoute} from '../../const';
import {getUserById} from '../../api/users';
import {StartButtons} from '../../components/StartButtons/StartButtons';
import {toast} from 'react-hot-toast';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';
// import {api} from '../../api/api';

type ExamCoverState = {
  examTitle?: string;
  creatorName?: string;
  creatorId?: number;
};

export default function ExamCover() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [cardsCount, setCardsCount] = useState(0);
  const [creator, setCreator] = useState('');
  const [starImage, setStarImage] = useState('star.svg');
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  const [exam, setExam] = useState<ExamOut | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) {
      navigate(AppRoute.NotFound);
      return;
    }

    let cancelled = false;
    const examId = Number(examIdParam);
    const routeState = (location.state as ExamCoverState | null) ?? null;

    if (routeState?.examTitle) {
      const preloadedExam: ExamOut = {
        id: examId,
        title: routeState.examTitle,
        creator_id: routeState.creatorId ?? 0
      };
      setExam(preloadedExam);
    }

    if (routeState?.creatorName) {
      setCreator(routeState.creatorName);
    }

    const resolveCreatorName = async (creatorId: number) => {
      try {
        const user = await getUserById(creatorId);
        if (cancelled) {
          return;
        }
        setCreator(user.user_name);
      } catch {
        // Keep current creator text from route state.
      }
    };

    getExam(examId)
      .then((res) => {
        if (cancelled) {
          return;
        }
        setExam(res);
        void resolveCreatorName(res.creator_id);
      })
      .catch(() => {
        if (!routeState?.examTitle) {
          navigate(AppRoute.NotFound);
        }
      });

    getCardsList(examId)
      .then((cards) => {
        if (cancelled) {
          return;
        }
        setCardsCount(cards.length);
      })
      .catch(() => {
        if (!routeState?.examTitle) {
          setCardsCount(0);
        }
      });

    if (routeState?.creatorId) {
      void resolveCreatorName(routeState.creatorId);
    }

    return () => {
      cancelled = true;
    };
  }, [location.state, navigate, searchParams]);

  useEffect(() => {
    if (!exam?.id) {
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    if (Number.isNaN(userId) || userId <= 0) {
      setStarImage('star.svg');
      return;
    }

    getPinnedExams(userId)
      .then((pinnedExams) => {
        const isPinned = pinnedExams.some((pinnedExam) => pinnedExam.id === exam.id);
        setStarImage(isPinned ? 'starActive.svg' : 'star.svg');
      })
      .catch(() => undefined);
  }, [exam?.id]);

  const changePinState = () => {
    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }

    if (starImage === 'star.svg') {
      pinExam(exam?.id).then(() => {
        setStarImage('starActive.svg');
      });
    } else {
      unpinExam(exam?.id).then(() => {
        setStarImage('star.svg');
      });
    }
  }

  const handleShareClick = async (
    e: React.MouseEvent<HTMLImageElement>
  ) => {
    e.stopPropagation();

    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка скопирована');
    } catch (err) {
      toast.error('Не удалось скопировать ссылку');
      console.error(err);
    }
  };


  return (
    <>
      <Header title={''} imgSrc={starImage} widthImg="38" heightImg="36"
              inputDisabled={true} inputRef={undefined} onInputBlur={() => {
      }} onTitleChange={() => {
      }}
              backButtonPage={'/'} onRightImageClick={isOnline ? (() => {
        changePinState();
      }) : undefined}/>
      <div className="screenСontent screenContentCentered">
        <div className={`${styles.titleBlock} ${styles.roundedBox}`}
             onClick={() => navigate(`/exam?examId=${exam?.id}`)}>
          <p className={styles.title}>{exam?.title}</p>
          <p className={styles.questionCount}>
            {cardsCount} вопросов
          </p>
          <p className={styles.author}>автор: {creator}</p>
          <div className={styles.shareButton} onClick={handleShareClick}>
            <img
              src="share2.svg"
              width='25'
            />
          </div>
        </div>
        <StartButtons exam={exam} cardsCount={cardsCount}/>
        {/*<button disabled={testLoading} onClick={handleTestNotification}>*/}
        {/*  {testLoading ? 'Запрос отправляется...' : 'Запланировать уведомления'}*/}
        {/*</button>*/}
      </div>
      <div className={styles.bottomGap}></div>
    </>
  );
}
