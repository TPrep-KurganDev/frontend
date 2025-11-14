import styles from './CardListEntry.module.scss';
import {NavigateFunction} from 'react-router-dom';

type CardListEntryProps = {
  id: string;
  question: string;
  answer: string;
  navigate: NavigateFunction
}

export function CardListEntry({question, answer, id, navigate}: CardListEntryProps) {
  return (
    <div key={id} className={styles.item} onClick={() => {navigate(`/card-edit?cardId=${id}`);}}>
      <div className={styles.itemNumber}>{id}</div>
      <div className={styles.listItem}>
        <p className={styles.itemTitle}>{question}</p>
        <p className={styles.itemSubtitle}>{answer}</p>
      </div>
    </div>
  );
}
