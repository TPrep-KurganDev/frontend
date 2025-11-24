import styles from './ExamCover.module.scss';

import Header from '../../components/Header/Header';

import { useEffect, useState } from 'react';
import { getExam, ExamOut } from '../../api/exam';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {createSession} from '../../api/session'
import {getCardsList} from '../../api/cards'
import {getUserById} from '../../api/users'

export default function ExamCover() {
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const [cardsCount, setCardsCount] = useState<number>(0);
  const [creator, setCreator] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);
    getExam(examId).then((res) => {
      setExam(res);
      getUserById(res.creator_id).then((user_res) => {
        setCreator(user_res.user_name);
      })
    });
    getCardsList(examId).then((res) => {setCardsCount(res.length)})
  }, [searchParams]);

  const startNewSession = (exam_id: number, strategy: string) => {
    createSession({exam_id: exam_id, strategy: strategy, n: null}).then(
      (response) => {navigate(`/session?sessionId=${response.id}`)}
    )
  }

  return (
    <>
      <Header title={''} imgSrc={'settingsCard.svg'} widthImg="38" heightImg="36" />
      <div className="screenСontent screenContentCentered">
        <div className={`${styles.titleBlock} ${styles.roundedBox}`}>
          <p className={styles.title}>{ exam?.title }</p>
          <p className={styles.questionCount} onClick={() => {
            navigate(`/exam?examId=${exam?.id}`);}}>{cardsCount} вопросов</p>
          <p className={styles.author}>автор: {creator}</p>
        </div>
        <div className={styles.firstRow}>
          <div className={`${styles.button} ${styles.yellowButton} ${styles.roundedBox}`}
          onClick={() => {startNewSession(exam.id, 'full')}}>
            <p>Пройти весь<br/>тест</p>
          </div>
          <div className={`${styles.button} ${styles.hardButton} ${styles.roundedBox}`}>
            <p>Умный подбор<br/>вопросов</p>
          </div>
        </div>
        <div className={`${styles.button} ${styles.grayButton} ${styles.roundedBox}`}>
          <p>Пройти n случайных<br/>вопросов</p>
        </div>
      </div>
    </>
  );
}
