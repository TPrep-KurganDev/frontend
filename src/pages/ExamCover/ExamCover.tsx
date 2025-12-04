import styles from './ExamCover.module.scss';
import Header from '../../components/Header/Header';
import {useEffect, useState} from 'react';
import {getExam, ExamOut} from '../../api/exam';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {getCardsList} from '../../api/cards';
import {AppRoute} from '../../const';
import {getUserById} from '../../api/users';
import {StartButtons} from '../../components/StartButtons/StartButtons';
import {PushNotificationButton} from '../../components/PushNotificationButton/PushNotificationButton';
import {api} from '../../api/api';

export default function ExamCover() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamOut | null>(null);
  const [cardsCount, setCardsCount] = useState(0);
  const [creator, setCreator] = useState('');
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) {
      navigate(AppRoute.NotFound);
      return;
    }

    const examId = Number(examIdParam);

    const loadData = async () => {
      try {
        const examData = await getExam(examId);
        if (!examData) return navigate(AppRoute.NotFound);

        setExam(examData);

        const user = await getUserById(examData.creator_id).catch(() => null);
        setCreator(user?.user_name || 'Неизвестный автор');

        const cards = await getCardsList(examId).catch(() => []);
        setCardsCount(cards.length);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams, navigate]);

  const handleTestNotification = async () => {
    if (!exam) return;
    setTestLoading(true);

    try {
      await api.post(`/exams/${exam.id}/pin`);
    } finally {
      setTestLoading(false);
    }
  };

  if (loading || !exam) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <>

      <Header title="" imgSrc="settingsCard.svg" widthImg="38" heightImg="36"/>

      <div className="screenСontent screenContentCentered">
        <div className={`${styles.titleBlock} ${styles.roundedBox}`}>
          <p className={styles.title}>{exam.title}</p>
          <p className={styles.questionCount} onClick={() => navigate(`/exam?examId=${exam.id}`)}>
            {cardsCount} вопросов
          </p>
          <p className={styles.author}>автор: {creator}</p>
        </div>
        <StartButtons exam={exam}/>
        <PushNotificationButton/>
        <button disabled={testLoading} onClick={handleTestNotification}>
          {testLoading ? 'Запрос отправляется...' : 'Тест уведомлений'}
        </button>
      </div>
    </>
  );
}
