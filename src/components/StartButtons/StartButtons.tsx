import styles from './StartButtons.module.scss';
import {createSession} from '../../api/session.ts';
import {useNavigate} from 'react-router-dom';
import {ExamOut} from '../../api/exam.ts';
import {useState} from 'react';
import {RandomQuestionsModal} from '../RandomQuestionsModal/RandomQuestionsModal';
import {AppRoute} from '../../const.ts';

type StartButtonsProps = {
  exam?: ExamOut | null;
  cardsCount?: number;
}

export function StartButtons({exam, cardsCount = 0}: StartButtonsProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startNewSession = (exam_id: number | undefined, strategy: string, n: number | null = null) => {
    createSession({exam_id: exam_id, strategy: strategy, n: n}).then(
      (response) => {navigate(`/session?sessionId=${response.id}`)}
    )
  }

  const handleRandomQuestions = (count: number) => {
    startNewSession(exam?.id, 'random', count);
  }

  const handleViewQuestions = () => {
    navigate(`${AppRoute.Exam}?examId=${exam?.id}`);
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
        <div className={`${styles.button} ${styles.grayButton}`}
             onClick={() => setIsModalOpen(true)}>
          Пройти n случайных вопросов
        </div>
        <div className={`${styles.button} ${styles.whiteButton}`}
             onClick={handleViewQuestions}>
          Просмотреть
        </div>
      </div>
      <RandomQuestionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRandomQuestions}
        maxQuestions={cardsCount}
      />
    </>
  )
}
