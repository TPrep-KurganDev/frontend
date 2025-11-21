import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {CardBase, CardOut, getCardsList} from '../../api/cards.ts';
import {ExamOut, getExam} from '../../api/exam.ts';
import {createCard} from '../../api/cards.ts';
import {c} from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

type ExamScreenProps = {
  canEdit: boolean;
}


export default function ExamScreen({canEdit} : ExamScreenProps) {
  const [cards, setCards] = useState<CardOut[]>([]);
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const navigate = useNavigate();

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);

    getExam(examId).then(setExam);

    getCardsList(examId)
      .then(setCards);
  }, [searchParams]);

  const createCardClick = () => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);
    createCard(examId, {question: 'Вопрос', answer: 'Ответ'});
    getCardsList(examId)
      .then(setCards);
  }

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
            key={q.card_id}
            question={q.question}
            answer={q.answer}
            id={(index + 1).toString()}
            onclick={() => {navigate(`/card-edit?cardId=${q.card_id}&examId=${searchParams.get('examId')}`);}}
          />
        ))}
        {canEdit && <CardListEntry question={''} answer={''} id={'+'} onclick={() => {createCardClick()}}/>}
      </div>
    </>
  );
}
