import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {questions} from '../../mocks/ListCards.ts';
import {titleExam} from '../../mocks/Header.ts';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {CardBase, getCard} from '../../api/cards.ts';
import {ExamOut, getExam} from '../../api/exam.ts';

type ExamScreenProps = {
  canEdit: boolean;
}


export default function ExamScreen({canEdit} : ExamScreenProps) {
  const [cards, setCards] = useState<CardBase[]>([]);
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();

  async function getMultipleCards(examId: number, cardsIds: number[]): Promise<CardBase[]> {
    const promises = cardsIds.map((id) => getCard(examId, id));
    return await Promise.all(promises);
  }

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);

    getExam(examId).then(setExam);

    const cardsIds = [2];

    getMultipleCards(examId, cardsIds)
      .then(setCards);
  }, [searchParams]);

  return (
    <>
      <Header title={exam?.title} {...(canEdit && {
        imgSrc: 'settingsCard.svg',
        widthImg: '38',
        heightImg: '36',
      })}/>
      <div className={styles.list}>
        {cards.map((q, index) => (
          <CardListEntry
            key={index + 1}
            question={q.question}
            answer={q.answer}
            id={(index + 1).toString()}            // порядковый номер начинается с 1
          />
        ))}
        {canEdit && <CardListEntry question={''} answer={''} id={'+'}/>}
      </div>
    </>
  );
}
