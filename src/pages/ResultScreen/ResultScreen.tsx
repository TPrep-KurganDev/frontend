import {ProgressBar} from '../../components/ProgressBar/ProgressBar.tsx';
import {StartButtons} from '../../components/StartButtons/StartButtons.tsx';
// import {progressBar} from '../../mocks/ProgressBar.ts';
import styles from './ResultScreen.module.scss';
import {ResultErrors} from '../../components/ResultErrors/ResultErrors.tsx';
import Header from '../../components/Header/Header.tsx';
import {ExamSessionResponse, getSession} from '../../api/session.ts';
import {useSearchParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {ExamOut, getExam} from '../../api/exam.ts';

export function ResultScreen(){
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('sessionId');
  const [progressBar, setProgressBar] = useState<ProgressBarType>({
    mistakesCount: 0,
    cardsCount: 0,
    doneCardsCount: 0,
    cardsProgress: []
  });
  const [sessionResponse, setSessionResponse] = useState<ExamSessionResponse>({
    exam_id: 0,
    id: '',
    questions: [],
    answers: {}});
  const [exam, setExam] = useState<ExamOut>({created_at: '', creator_id: 0, id: 0, title: ''});
  const mistakesIds = Object.entries(sessionResponse.answers ?? {})
    .filter(([, value]) => !value)
    .map(([key]) => Number(key));

  useEffect(() => {
    if (!sessionIdParam) {
      return;
    }

    getSession(sessionIdParam).then((session_res) => {
      const answers = session_res.answers ?? {};
      const cardsProgress = Object.values(answers);
      const mistakeCount = cardsProgress.filter(v => !v).length;

      setSessionResponse({
        ...session_res,
        answers
      });

      setProgressBar({
        cardsCount: session_res.questions.length,
        cardsProgress,
        doneCardsCount: session_res.questions.length - mistakeCount,
        mistakesCount: mistakeCount
      });

      getExam(session_res.exam_id).then((exam_res) => {
        setExam(exam_res);
      }).catch(() => undefined);
    }).catch(() => undefined);
  }, [sessionIdParam]);
  return (
    <>
      <Header title={exam.title} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}}
              onTitleChange={() => {}} backButtonPage={`/exam-cover?examId=${exam.id}`}/>

      <div className={styles.body}>
        <ProgressBar progressBar={progressBar}/>
        <ResultErrors mistakesId={mistakesIds}/>
        {/*<div className={styles.nextRepeat}>Следующее повторение через 2 часа сегодня в 14:45</div>*/}
        <StartButtons exam={exam} cardsCount={sessionResponse.questions.length}/>
      </div>
    </>
  )
}
