import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {questions} from '../../mocks/ListCards.ts';
import {titleExam} from '../../mocks/Header.ts';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

export default function ExamScreen() {
  return (
    <>
      <Header title={titleExam} imgSrc={'settingsCard.svg'} widthImg="38" heightImg="36" />
      <div className={styles.list}>
        {questions.map((q) => (
          <CardListEntry question={q.title} answer={q.answer} id={q.id.toString()}/>
        ))}
        <CardListEntry question={''} answer={''} id={'+'}/>
      </div>
    </>
  );
}
