import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

import {useEffect, useRef, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {CardOut, getCardsList} from '../../api/cards.ts';
import {ExamOut, getExam, deleteExam, updateExam} from '../../api/exam.ts';
import {createCard} from '../../api/cards.ts';
import {AppRoute} from '../../const.ts';
import {BottomSheet} from '../../components/BottomSheet/BottomSheet.tsx';

type ExamScreenProps = {
  canEdit: boolean;
}


export default function ExamScreen({canEdit} : ExamScreenProps) {
  const [cards, setCards] = useState<CardOut[]>([]);
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const [examTitle, setExamTitle] = useState('');
  const [bottomScreenOpen, setBottom] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(true);
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

  const inputRef = useRef(null);

  const renameClick = () => {
    setInputDisabled(false);
    setBottom(false);
    setTimeout(() => { // @ts-ignore
      inputRef.current.focus();}, 50);
  };

  const renameEnd = () => {
    setInputDisabled(true);
  };

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

  const renameExam = () => {
    updateExam(exam?.id, {title: examTitle});
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      renameExam();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [examTitle]);

  return (
    <>
      <Header inputDisabled={inputDisabled} title={examTitle} inputRef={inputRef} onInputBlur={renameEnd} onTitleChange={setExamTitle} {...(canEdit && {
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
          { text: 'Переименовать', onclick: renameClick, color: '#353535' },
          // { text: 'Редактировать права доступа', onclick: () => alert('share'), color: '#353535' },
          { text: 'Удалить', onclick: deleteExamClick, color: '#F7474A' }
        ]}
      />
    </>
  );
}
