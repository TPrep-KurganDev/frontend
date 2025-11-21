import {Footer} from '../../components/Footer/Footer.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {questions} from '../../mocks/ListCards.ts';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {titleExam} from '../../mocks/Header.ts';
import {useState, useEffect} from 'react';
import {FooterCard} from '../../types/FooterCard.ts';
import {answerQuestion, getSession} from '../../api/session.ts';
import {useSearchParams} from 'react-router-dom';
import {fa, ne} from "@faker-js/faker";
import {getCard} from "../../api/cards.ts";

export type CardState = {
  isFlipped: boolean,
  question: string,
  answer: string
}

export function CardScreen() {
  const currentQuestion = questions[3];
  const [card, setCard] = useState<CardState>({isFlipped: false, question: '', answer:''});
  const [searchParams] = useSearchParams();

  const handleCardClick = () => {
    setCard({...card, isFlipped: !card.isFlipped});
  };

  const [footer, setFooter] = useState<FooterCard>({
    mistakesCount: 0,
    cardsCount: 0,
    doneCardsCount: 0,
    cardsProgress: [],
  });

  const sessionIdParam = searchParams.get('sessionId');
  if (!sessionIdParam) return null;

  const [currentCards, setCurrentCards] = useState<number[]>([]);

  useEffect(() => {
    getSession(sessionIdParam).then((session) => {
      setFooter((prevFooter) => ({
        ...prevFooter,
        cardsCount: session.questions.length
      }));
      setCurrentCards(session.questions);
      setNewCard(session.questions[footer.doneCardsCount]);
    });
  }, [sessionIdParam]);



  const setNewCard = (cardId: number) => {
    getCard(cardId).then((new_card) => {
      setCard({isFlipped: false, answer: new_card.answer, question: new_card.question});
    })
  }

  const handleCorrectAnswer = () => {
    const updatedFooter = {...footer};
    updatedFooter.cardsProgress.push(true);
    updatedFooter.doneCardsCount += 1;
    setFooter(updatedFooter);
    setCard({...card, isFlipped: !card.isFlipped});
    setNewCard(currentCards[updatedFooter.doneCardsCount]);
    answerQuestion(sessionIdParam, currentCards[updatedFooter.doneCardsCount - 1], true);
  }

  const handleFalseAnswer = () => {
    const updatedFooter = {...footer};
    updatedFooter.cardsProgress.push(false);
    updatedFooter.mistakesCount += 1;
    updatedFooter.doneCardsCount += 1;
    setFooter(updatedFooter);
    setCard({...card, isFlipped: !card.isFlipped});
    setNewCard(currentCards[updatedFooter.doneCardsCount]);
    answerQuestion(sessionIdParam, currentCards[updatedFooter.doneCardsCount - 1], false);
  }


  return (
    <>
      <Header title={titleExam}/>
      <div className="screenСontent screenContentCentered">
        <Card
          onFlip={handleCardClick}
          card={card}
        />
        {card.isFlipped && <RatingAnswer onCorrect={handleCorrectAnswer} onFail={handleFalseAnswer}/>}
      </div>
      <Footer footer={footer}/>
    </>
  )
}
