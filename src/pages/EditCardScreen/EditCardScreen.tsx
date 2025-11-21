import Header from '../../components/Header/Header.tsx';
import styles from './EditCardScreen.module.scss';

import {useEffect, useState} from 'react';
import {getCard, updateCard, deleteCard} from '../../api/cards.ts';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {BlueButton} from '../../components/BlueButton/BlueButton.tsx';

type EditCardScreenProps = {
  canEdit: boolean;
}

export function EditCardScreen({canEdit}: EditCardScreenProps) {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;

    const cardId = Number(cardIdParam);
    getCard(cardId).then((card) => {
      setAnswer(card.answer);
      setQuestion(card.question);
    });
  }, [searchParams])

  const updateCardClick = () => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    updateCard(Number(examIdParam), Number(cardIdParam), {question, answer});
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

  return (
    <>
      <Header title='' {...(canEdit && {
        imgSrc: 'deleteCard.svg',
        widthImg: '38',
        heightImg: '30',
        onRightImageClick: deleteCardClick
      })}/>
      <input
        className={`${styles.question} ${!canEdit ? styles.noEdit : ''}`}
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <input
        className={`${styles.answer} ${!canEdit ? styles.noEdit : ''}`}
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div onClick={() => {updateCardClick()}}>
        <BlueButton title="Сохранить"/>
      </div>
    </>
  )
}
