import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

import { useEffect, useState } from 'react';
import { getCreatedExams, ExamOut } from '../../api/exam';
import { useNavigate } from "react-router-dom";

export function ExamListScreen() {
  const [exams, setExams] = useState<ExamOut[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = 63;
    getCreatedExams(userId).then(setExams);
  }, []);

  return (
    <>
      <Header title={'Мои тесты'}/>
      <div className={styles.examList}>
        {exams.map((exam: ExamOut) => (<div className={styles.button} onClick={ () => {navigate(`/exam-cover?examId=${exam.id}`);} }>
          {exam.title}
        </div>))}
      </div>
    </>
  )
}
