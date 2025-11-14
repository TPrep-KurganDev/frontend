import Header from '../../components/Header/Header.tsx';
import styles from './EditCardScreen.module.scss';

import {useEffect, useState} from 'react';
import {CardBase, getCard} from '../../api/cards.ts';
import {useSearchParams} from 'react-router-dom';

type EditCardScreenProps = {
  canEdit: boolean;
}

export function EditCardScreen({canEdit}: EditCardScreenProps) {
  const [card, setCard] = useState<CardBase>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cardIdParam = searchParams.get('cardId');
    if (!cardIdParam) return;

    const cardId = Number(cardIdParam);
    getCard(cardId).then(setCard);
  }, [searchParams])

  return (
    <>
      <Header title='' {...(canEdit && {
        imgSrc: 'deleteCard.svg',
        widthImg: '38',
        heightImg: '30',
      })}/>
      <div className={`${styles.question} ${!canEdit ? styles.noEdit : ''}`}>{card?.question}</div>
      <div className={`${styles.answer} ${!canEdit ? styles.noEdit : ''}`}>{card?.answer}</div>
    </>
  )
}
