import Header from '../../components/Header/Header.tsx';
import styles from './EditCardScreen.module.scss';

import {useEffect, useState} from 'react';
import {getCard, updateCard, deleteCard} from '../../api/cards.ts';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {TextAreaAuto} from '../../components/TextAreaAuto/TextAreaAuto';
import {getExam} from "../../api/exam.ts";
import {AppRoute} from "../../const.ts";


export function EditCardScreen() {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [examId, setExamId] = useState(0);
  const [cardId, setCardId] = useState(0);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;
    setCardId(Number(cardIdParam));
    getCard(Number(cardIdParam)).then((card) => {
      setAnswer(card.answer);
      setQuestion(card.question);
    });

    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;
    setExamId(Number(examIdParam));
    getExam(Number(examIdParam)).then((ex) => {
      setExamId(ex.id);
      if (ex.creator_id === Number(localStorage.getItem('userId'))){
        setCanEdit(true);
      }
    }).catch(() => {
      navigate(AppRoute.NotFound);
    });
  }, [navigate, searchParams])

  const sendUpdateCard = () => {
    updateCard(Number(examId), Number(cardId), {question, answer});
  }

  const deleteCardClick = () => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    deleteCard(Number(examIdParam), Number(cardIdParam)).then(() => {
      navigate(`/exam?examId=${examIdParam}`);
    })
  }

  const onQuestionChange = (value: string) => {
    if (canEdit){
      setQuestion(value);
    }
  }

  const onAnswerChange = (value: string) => {
    if (canEdit){
      setAnswer(value);
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      sendUpdateCard();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [question, answer]);

  return (
    <>
      <Header title='' {...(canEdit && {
        imgSrc: 'deleteCard.svg',
        widthImg: '38',
        heightImg: '30',
        onRightImageClick: deleteCardClick
      })} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}}
              backButtonPage={`/exam?examId=${examId}`}/>

      <TextAreaAuto
        value={question}
        onChange={onQuestionChange}
        className={`${styles.question} ${!canEdit ? styles.noEdit : ''}`}
        disabled={!canEdit}
      />

      <TextAreaAuto
        value={answer}
        onChange={onAnswerChange}
        className={`${styles.answer} ${!canEdit ? styles.noEdit : ''}`}
        disabled={!canEdit}
      />



    </>
  )
}
