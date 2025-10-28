import styles from './CardListEntry.module.scss';

type CardListEntryProps = {
  id: string;
  question: string;
  answer: string;
}

export function CardListEntry({question, answer, id}: CardListEntryProps) {
  return (
    <div key={id} className={styles.item}>
      <div className={styles.itemNumber}>{id}</div>
      <div className={styles.listItem}>
        <p className={styles.itemTitle}>{question}</p>
        <p className={styles.itemSubtitle}>{answer}</p>
      </div>
    </div>
  );
}
