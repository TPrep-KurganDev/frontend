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
    }).catch(() => {
      navigate(AppRoute.NotFound);
    });

    getCardsList(examId)
      .then(setCards).catch(() => {
      navigate(AppRoute.NotFound);
    });
  }, [navigate, searchParams]);

  const inputRef = useRef(null);

  const renameClick = () => {
    setInputDisabled(false);
    setBottom(false);
    setTimeout(() => { // @ts-expect-error ignore
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

  useEffect(() => {
    const handler = setTimeout(() => {
      updateExam(exam?.id, {title: examTitle});
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [exam?.id, examTitle]);

  return (
    <>
      <Header inputDisabled={inputDisabled} title={examTitle} inputRef={inputRef} onInputBlur={renameEnd} onTitleChange={setExamTitle} {...(canEdit && {
        imgSrc: 'settingsCard.svg',
        widthImg: '38',
        heightImg: '36',
        onRightImageClick: () => {setBottom(true)}
      })}
              backButtonPage={`/exam-cover?examId=${exam?.id}`}/>
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
        <div key={1000} className={styles.uploadItem} onClick={() => {navigate(`/file-upload?examId=${exam?.id}`)}}>
          <div className={styles.uploadIcon}>
            <img src='upload button.svg' alt='' width={16}/>
          </div>
          <div className={styles.uploadListItem}>
            <p className={styles.uploadTitle}>Загрузить из файла</p>
          </div>
        </div>
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
