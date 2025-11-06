import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

import { useEffect, useState } from 'react';
import { getCreatedExams, ExamOut } from '../../api/exam';

export function ExamListScreen() {
  const [exams, setExams] = useState<ExamOut[]>([]);

  useEffect(() => {
    // В реальности creatorId можно брать из токена или состояния пользователя
    const userId = 55;
    getCreatedExams(userId).then(setExams);
  }, []);

  return (
    <>
      <Header title={'Мои тесты'}/>
      <div className={styles.examList}>
        {exams.map((exam: ExamOut) => (<div className={styles.button}>{exam.title}</div>))}
      </div>
    </>
  )
}
