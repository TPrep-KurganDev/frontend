import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

import {useEffect, useState} from 'react';
import {getCreatedExams, getPinnedExams, ExamOut} from '../../api/exam';
import {useNavigate} from 'react-router-dom';

type ExamListScreenProps = {
  isFavorites: boolean;
}

export function ExamListScreen({isFavorites}: ExamListScreenProps) {
  const [exams, setExams] = useState<ExamOut[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Number(localStorage.getItem('userId'));
    if (isFavorites){
      getPinnedExams(userId).then(setExams);
    }
    else {
      getCreatedExams(userId).then(setExams);
    }
  }, [isFavorites]);

  return (
    <>
      <Header title={isFavorites ? 'Готовлюсь к этим тестам' : 'Мои тесты'}
              inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}}
              backButtonPage={'/'}/>
      <div className={styles.examList}>
        {exams.map((exam) => (
          <div className={`${styles.listItem} ${isFavorites ? styles.favorites : ''}`} onClick={() => {
            navigate(`/exam-cover?examId=${exam.id}`);}} >
            <div className={styles.name}>{exam.title}</div>
            {/*{isFavorites && <div className={styles.author}>{exam.creator_id}</div>}*/}
          </div>
        ))}
      </div>
    </>
  )
}
