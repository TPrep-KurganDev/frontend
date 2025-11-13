import styles from './ExamCover.module.scss';

import Header from '../../components/Header/Header';

import { useEffect, useState } from 'react';
import { getExam, ExamOut } from '../../api/exam';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ExamCover() {
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const navigate = useNavigate();

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);
    getExam(examId).then(setExam);
  }, []);

  return (
    <>
      <Header title={''} imgSrc={'settingsCard.svg'} widthImg="38" heightImg="36" />
      <div className="screenСontent screenContentCentered">
        <div className={`${styles.titleBlock} ${styles.roundedBox}`}>
          <p className={styles.title}>{ exam?.title }</p>
          <p className={styles.questionCount} onClick={() => {
            navigate(`/exam?examId=${exam?.id}`);}}>12 вопросов</p>
          <p className={styles.author}>автор: Беня Салин</p>
        </div>
        <div className={styles.firstRow}>
          <div className={`${styles.button} ${styles.yellowButton} ${styles.roundedBox}`}>
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
