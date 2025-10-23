import {useState} from 'react';
import styles from './Card.module.scss';

type CardProps = {
  question: string;
  answer: string;
}

export function Card({question, answer}: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''}`} onClick={handleCardClick}>
      <div className={styles.question}>{question}</div>
      <div className={styles.answer}>{answer}</div>
    </div>
  );
}
