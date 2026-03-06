import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

import {useEffect, useState} from 'react';
import {getCreatedExams, getPinnedExams, ExamOut} from '../../api/exam';
import {useNavigate} from 'react-router-dom';
import {getUserById} from '../../api/users';
import {prefetchExamGraph} from '../../offline/prefetch';

type ExamListScreenProps = {
  isFavorites: boolean;
}

export function ExamListScreen({isFavorites}: ExamListScreenProps) {
  const [exams, setExams] = useState<ExamOut[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Number(localStorage.getItem('userId'));
    if (Number.isNaN(userId) || userId <= 0) {
      setExams([]);
      return;
    }

    const loadExams = async () => {
      try {
        const data = isFavorites
          ? await getPinnedExams(userId)
          : await getCreatedExams(userId);
        setExams(data);
      } catch {
        setExams([]);
      }
    };

    void loadExams();
  }, [isFavorites]);

  useEffect(() => {
    if (exams.length === 0) {
      return;
    }

    void prefetchExamGraph(exams);
  }, [exams]);

  useEffect(() => {
    const fetchAuthorNames = async () => {
      const creatorIds = [...new Set(exams.map((exam) => exam.creator_id))];
      const fetchedNames: Record<number, string> = {};
      const results = await Promise.allSettled(creatorIds.map((creatorId) => getUserById(creatorId)));

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return;
        }

        const creatorId = creatorIds[index];
        fetchedNames[creatorId] = result.value.user_name;
      });

      setAuthorNames(fetchedNames);
    };

    if (exams.length > 0) {
      void fetchAuthorNames();
    } else {
      setAuthorNames({});
    }
  }, [exams]);

  return (
    <>
      <Header title={isFavorites ? 'Готовлюсь к этим тестам' : 'Мои тесты'}
              inputDisabled={true} inputRef={undefined} onInputBlur={() => {
      }} onTitleChange={() => {
      }}
              backButtonPage={'/'}/>
      <div className={styles.examList}>
        {exams.map((exam) => (
          <div
            key={exam.id}
            className={`${styles.listItem} ${isFavorites ? styles.favorites : ''}`}
            onClick={() => {
            const creatorName = authorNames[exam.creator_id] ?? '';
            navigate(`/exam-cover?examId=${exam.id}`, {
              state: {
                examTitle: exam.title,
                creatorName,
                creatorId: exam.creator_id
              }
            });
            }}
          >
            <div className={styles.name}>{exam.title}</div>
            {isFavorites && <div className={styles.author}>автор: {authorNames[exam.creator_id] || 'Загрузка...'}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
