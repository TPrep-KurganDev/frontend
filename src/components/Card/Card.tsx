import styles from './Card.module.scss';
import {CardState} from '../../pages/CardScreen/CardScreen.tsx';

type CardProps = {
  onFlip: () => void;
  card: CardState;
}

export function Card({onFlip, card}: CardProps) {
  return (
    <div className={`${styles.card} ${card.isFlipped ? styles.cardFlipped : ''}`} onClick={onFlip}>
      <div className={styles.question}>{card.question}</div>
      <div className={styles.answer}>{card.answer}</div>
    </div>
  );
}
