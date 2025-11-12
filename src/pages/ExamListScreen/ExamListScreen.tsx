const exams = [{
  name: 'Зачёт по сетям',
  author: 'автор: К. С.'},
  {
    name: 'Экзамен по матстату',
    author: 'автор: Hlopin'}];
import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

import { useEffect, useState } from 'react';
import { getCreatedExams, ExamOut } from '../../api/exam';
import { useNavigate } from 'react-router-dom';

type ExamListScreenProps = {
  isFavorites : boolean;
}

export function ExamListScreen({isFavorites}: ExamListScreenProps) {
  const [exams, setExams] = useState<ExamOut[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = 4;
    getCreatedExams(userId).then(setExams);
  }, []);

  return (
    <>
      <Header title={isFavorites ? 'Готовлюсь к этим тестам' : 'Мои тесты'}/>
      <div className={styles.examList}>
        {exams.map((exam: ExamOut) => (<div className={styles.button} onClick={ () => {navigate(`/exam-cover?examId=${exam.id}`);} }>
          {exam.title}
        </div>))}
        {exams.map((exam) => (
          <div className={`${styles.listItem} ${isFavorites ? styles.favorites : ''}`}>
            <div className={styles.name}>{exam.name}</div>
            {isFavorites && <div className={styles.author}>{exam.author}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
