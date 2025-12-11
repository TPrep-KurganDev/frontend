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
  const [progressBar, setProgressBar] = useState<ProgressBarType>({
    mistakesCount: 2,
    cardsCount: 24,
    doneCardsCount: 22,
    cardsProgress: []
  });
  const [sessionResponse, setSessionResponse] = useState<ExamSessionResponse>({
    exam_id: 0,
    id: '',
    questions: [],
    answers: []});
  const [exam, setExam] = useState<ExamOut>({created_at: '', creator_id: 0, id: 0, title: ''});

  useEffect(() => {
    const sessionIdParam = searchParams.get('sessionId');
    // setProgressBar(progressBarTemp);
    getSession(sessionIdParam).then((session_res) => {
      setSessionResponse(session_res);
      const newProgressBar: ProgressBarType = {cardsCount: 0, cardsProgress: [], doneCardsCount: 0, mistakesCount: 0};
      newProgressBar.cardsProgress = Object.values(session_res.answers);
      newProgressBar.cardsCount = session_res.questions.length;
      const mistakeCount = Object.values(session_res.answers).filter(v => !v).length;
      newProgressBar.doneCardsCount = session_res.questions.length - mistakeCount;
      newProgressBar.mistakesCount = mistakeCount;
      setProgressBar(newProgressBar);
      getExam(session_res.exam_id).then((exam_res) => {
        setExam(exam_res);
      })
    });
  }, [searchParams]);
  return (
    <>
      <Header title={exam.title} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}}
              onTitleChange={() => {}} backButtonPage={`/exam-cover?examId=${exam.id}`}/>

      <div className={styles.body}>
        <ProgressBar progressBar={progressBar}/>
        <ResultErrors mistakesId={Object.entries(sessionResponse!.answers).filter(([, value]) => !value).map(([key]) => Number(key))}/>
        {/*<div className={styles.nextRepeat}>Следующее повторение через 2 часа сегодня в 14:45</div>*/}
        <StartButtons exam={exam} cardsCount={sessionResponse.questions.length}/>
      </div>
    </>
  )
}
