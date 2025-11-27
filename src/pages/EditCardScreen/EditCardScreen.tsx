import Header from '../../components/Header/Header.tsx';
import styles from './EditCardScreen.module.scss';

import {useEffect, useState} from 'react';
import {getCard, updateCard, deleteCard} from '../../api/cards.ts';
import {useSearchParams, useNavigate} from 'react-router-dom';

type EditCardScreenProps = {
  canEdit: boolean;
}

export function EditCardScreen({canEdit}: EditCardScreenProps) {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [examId, setExamId] = useState(0);
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

  const sendUpdateCard = () => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;
    setExamId(Number(examIdParam));

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

  const onQuestionChange = (value: string) => {
    setQuestion(value);
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
      <input
        className={`${styles.question} ${!canEdit ? styles.noEdit : ''}`}
        type="text"
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
      />
      <input
        className={`${styles.answer} ${!canEdit ? styles.noEdit : ''}`}
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
    </>
  )
}
