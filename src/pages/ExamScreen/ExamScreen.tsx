import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {questions} from '../../mocks/ListCards.ts';
import {titleExam} from '../../mocks/Header.ts';

export default function ExamScreen() {
  return (
    <>
      <Header title={titleExam}/>
        <div className={styles.list}>
          {questions.map((q) => (
            <div key={q.id} className={styles.item}>
              <div className={styles.itemNumber}>{q.id}</div>
              <div className={styles.listItem}>
                <p className={styles.itemTitle}>{q.title}</p>
                <p className={styles.itemSubtitle}>{q.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
    </>
  );
}
