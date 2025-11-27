import styles from './StartButtons.module.scss';
import {createSession} from '../../api/session.ts';
import {useNavigate} from 'react-router-dom';
import {ExamOut} from '../../api/exam.ts';

type StartButtonsProps = {
  exam?: ExamOut | undefined;
}

export function StartButtons({exam}: StartButtonsProps) {
  const navigate = useNavigate();

  const startNewSession = (exam_id: number | undefined, strategy: string) => {
    createSession({exam_id: exam_id, strategy: strategy, n: null}).then(
      (response) => {navigate(`/session?sessionId=${response.id}`)}
    )
  }

  return (
    <>
      <div className={styles.firstRow}>
        <div className={`${styles.button} ${styles.yellowButton}`}
             onClick={() => {
               startNewSession(exam?.id, 'full')
             }}>
          Пройти весь тест
        </div>
        <div className={`${styles.button} ${styles.hardButton}`}
             onClick={() => {
               startNewSession(exam?.id, 'smart')
             }}>
          Умный подбор вопросов
        </div>
      </div>
      <div className={styles.secondRow}>
      {/*<div className={`${styles.button} ${styles.grayButton}`}>*/}
      {/*  Пройти n случайных вопросов*/}
      {/*</div>*/}
      </div>
    </>
  )
}
