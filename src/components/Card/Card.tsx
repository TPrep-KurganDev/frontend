import styles from './Card.module.scss';

type CardProps = {
  question: string;
  answer: string;
  onFlip: () => void;
  isFlipped: boolean;
}

export function Card({question, answer, onFlip, isFlipped}: CardProps) {
  return (
    <div className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''}`} onClick={onFlip}>
      <div className={styles.question}>{question}</div>
      <div className={styles.answer}>{answer}</div>
    </div>
  );
}
