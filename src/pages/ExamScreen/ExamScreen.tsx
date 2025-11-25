import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {CardOut, getCardsList} from '../../api/cards.ts';
import {ExamOut, getExam, deleteExam} from '../../api/exam.ts';
import {createCard} from '../../api/cards.ts';
import {AppRoute} from '../../const.ts';
import {BottomSheet} from "../../components/BottomSheet/BottomSheet.tsx";
import {tr} from "@faker-js/faker";

type ExamScreenProps = {
  canEdit: boolean;
}


export default function ExamScreen({canEdit} : ExamScreenProps) {
  const [cards, setCards] = useState<CardOut[]>([]);
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const [examTitle, setExamTitle] = useState('');
  const [bottomScreenOpen, setBottom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);

    getExam(examId).then((ex) => {
      setExam(ex);
      setExamTitle(ex.title);
    });

    getCardsList(examId)
      .then(setCards);
  }, [searchParams]);

  if (!exam) {
    navigate(AppRoute.NotFound);
  }

  const createCardClick = () => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);
    createCard(examId, {question: 'Вопрос', answer: 'Ответ'}).then(
      () => {
        getCardsList(examId)
          .then(setCards);
      }
    );

  }

  const deleteExamClick = () => {
    deleteExam(exam?.id).then(() => {navigate('/exam-list')});
  }

  return (
    <>
      <Header title={examTitle} {...(canEdit && {
        imgSrc: 'settingsCard.svg',
        widthImg: '38',
        heightImg: '36',
        onRightImageClick: () => {setBottom(true)}
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

      <BottomSheet
        open={bottomScreenOpen}
        onClose={() => setBottom(false)}
        buttons={[
          { text: 'Переименовать', onclick: () => alert('edit'), color: '#353535' },
          { text: 'Редактировать права доступа', onclick: () => alert('share'), color: '#353535' },
          { text: 'Удалить', onclick: () => alert('delete'), color: '#F7474A' }
        ]}
      />
    </>
  );
}
