import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

import {useEffect, useState} from 'react';
import {getCreatedExams, getPinnedExams, ExamOut} from '../../api/exam';
import {useNavigate} from 'react-router-dom';
import {getUserById} from '../../api/users';
import {prefetchExamGraph} from '../../offline/prefetch';
import {ExamListItem} from '../../components/ExamListItem/ExamListItem.tsx';

type ExamListScreenProps = {
  isFavorites: boolean;
}

export function ExamListScreen({isFavorites}: ExamListScreenProps) {
  const [exams, setExams] = useState<ExamOut[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [testsLoaded, setTestsLoaded] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    setTestsLoaded(true)
    const userId = localStorage.getItem('userId');

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
      const fetchedNames: Record<string, string> = {};
      const results = await Promise.allSettled(creatorIds.map((creatorId) => getUserById(creatorId)));

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return;
        }

        const creatorId = creatorIds[index];
        fetchedNames[creatorId!] = result.value.user_name;
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
        <div className={styles.loadingText}>
          <p className={styles.syncText}>{ testsLoaded ? 'Тесты скачаны' : 'Идёт синхронизация тестов...'}</p>
          { !testsLoaded && (
            <div className={styles.loader}>
              <img className={styles.spinner} src='loader.svg'/>
            </div>
          ) }
          { testsLoaded && (
            <img className={styles.spinner} src='ready.svg'/>
          ) }
        </div>
        {exams.map((exam) => (
          <ExamListItem
            key={exam.id}
            exam={exam}
            authorNames={authorNames}
            isFavorites={isFavorites}
            navigate={navigate}
          />
        ))}
      </div>
    </>
  )
}
