import Header from '../../components/Header/Header.tsx';
import styles from './EditCardScreen.module.scss';

import {useCallback, useEffect, useState} from 'react';
import {getCard, getCardsList, updateCard, deleteCard} from '../../api/cards.ts';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {TextAreaAuto} from '../../components/TextAreaAuto/TextAreaAuto';
import {getExam} from '../../api/exam.ts';
import {AppRoute} from '../../const.ts';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';


export function EditCardScreen() {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [examId, setExamId] = useState('');
  const [cardId, setCardId] = useState(0);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;
    const parsedCardId = Number(cardIdParam);
    setCardId(parsedCardId);

    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;
    setExamId(examIdParam);

    getCard(parsedCardId)
      .then((card) => {
        setAnswer(card.answer);
        setQuestion(card.question);
      })
      .catch(() => {
        getCardsList(examId)
          .then((cards) => {
            const card = cards.find((item) => item.card_id === parsedCardId);
            if (!card) {
              return;
            }

            setAnswer(card.answer);
            setQuestion(card.question);
          })
          .catch(() => undefined);
      });

    getExam(examIdParam).then((ex) => {
      setExamId(ex.id);
      setCanEdit(isOnline && ex.creator_id === localStorage.getItem('userId'));
    }).catch(() => {
      navigate(AppRoute.NotFound);
    });
  }, [examId, isOnline, navigate, searchParams])

  const sendUpdateCard = useCallback(() => {
    if (!canEdit || cardId <= 0) {
      return;
    }

    updateCard(examId, Number(cardId), {question, answer});
  }, [answer, canEdit, cardId, examId, question]);

  const deleteCardClick = () => {
    if (!canEdit) {
      if (!isOnline) {
        notifyOnlineOnly();
      }
      return;
    }

    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    deleteCard(examIdParam, Number(cardIdParam)).then(() => {
      navigate(`/exam?examId=${examIdParam}`);
    })
  }

  const onQuestionChange = (value: string) => {
    if (canEdit) {
      setQuestion(value);
    }
  }

  const onAnswerChange = (value: string) => {
    if (canEdit) {
      setAnswer(value);
    }
  }

  useEffect(() => {
    if (!canEdit) {
      return;
    }

    const handler = setTimeout(() => {
      sendUpdateCard();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [canEdit, sendUpdateCard]);

  return (
    <>
      <Header title='' {...(canEdit && {
        imgSrc: 'deleteCard.svg',
        widthImg: '38',
        heightImg: '30',
        onRightImageClick: deleteCardClick
      })} inputDisabled={true} inputRef={undefined} onInputBlur={() => {
      }} onTitleChange={() => {
      }}
              backButtonPage={`/exam?examId=${examId}`}/>

      <TextAreaAuto
        value={question}
        onChange={onQuestionChange}
        className={`${styles.question} ${!canEdit ? styles.noEdit : ''}`}
        disabled={!canEdit}
        ai_fill={false}
      />

      <TextAreaAuto
        value={answer}
        onChange={onAnswerChange}
        className={`${styles.answer} ${!canEdit ? styles.noEdit : ''}`}
        disabled={!canEdit}
        ai_fill={true}
      />
    </>
  )
}
