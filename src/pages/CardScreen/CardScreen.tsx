import {ProgressBar} from '../../components/ProgressBar/ProgressBar.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {answerQuestion, getSession} from '../../api/session.ts';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {getCard} from '../../api/cards.ts';
import {ExamOut, getExam} from '../../api/exam.ts';

export type CardState = {
  isFlipped: boolean,
  question: string,
  answer: string
}

export function CardScreen() {
  const [card, setCard] = useState<CardState>({isFlipped: false, question: '', answer:''});
  const [exam, setExam] = useState<ExamOut>({created_at: '', creator_id: 0, id: 0, title: ''});
  const [currentCards, setCurrentCards] = useState<number[]>([]);
  const offlineCardsByIdRef = useRef<Record<number, { question: string; answer: string }>>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleCardClick = () => {
    setCard((prevCard) => ({...prevCard, isFlipped: !prevCard.isFlipped}));
  };

  const [progressBar, setProgressBar] = useState<ProgressBarType>({
    mistakesCount: 0,
    cardsCount: 0,
    doneCardsCount: 0,
    cardsProgress: [],
  });

  const sessionIdParam = searchParams.get('sessionId');

  const setNewCard = useCallback((
    cardId: number | undefined,
    sourceOfflineCards: Record<number, { question: string; answer: string }> = offlineCardsByIdRef.current
  ) => {
    if (typeof cardId !== 'number') {
      return;
    }

    const offlineCard = sourceOfflineCards[cardId];
    if (offlineCard) {
      setCard({isFlipped: false, answer: offlineCard.answer, question: offlineCard.question});
      return;
    }

    getCard(cardId).then((newCard) => {
      setCard({isFlipped: false, answer: newCard.answer, question: newCard.question});
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!sessionIdParam) {
      return;
    }

    getSession(sessionIdParam).then((session) => {
      const answersValues = Object.values(session.answers ?? {});
      const doneCardsCount = answersValues.length;
      const mistakesCount = answersValues.filter((value) => !value).length;

      setProgressBar({
        cardsCount: session.questions.length,
        cardsProgress: answersValues,
        doneCardsCount,
        mistakesCount
      });
      setCurrentCards(session.questions);
      offlineCardsByIdRef.current = session.offline_cards ?? {};
      setNewCard(session.questions[doneCardsCount], offlineCardsByIdRef.current);
      getExam(session.exam_id).then((exam_res) => {
        setExam(exam_res);
      }).catch(() => undefined);
    }).catch(() => undefined);
  }, [sessionIdParam, setNewCard]);

  if (!sessionIdParam) {
    return null;
  }

  const handleAnswer = (answerCorrectness: boolean) => {
    const updatedProgressBar = {...progressBar};
    updatedProgressBar.cardsProgress.push(answerCorrectness);
    if (answerCorrectness){
      updatedProgressBar.doneCardsCount += 1;
    }
    else {
      updatedProgressBar.mistakesCount += 1;
      updatedProgressBar.doneCardsCount += 1;
    }
    setProgressBar(updatedProgressBar);
    setCard((prevCard) => ({...prevCard, isFlipped: !prevCard.isFlipped}));

    const answeredCardId = currentCards[updatedProgressBar.doneCardsCount - 1];
    const nextCardId = currentCards[updatedProgressBar.doneCardsCount];
    const isLastCard = currentCards.length === updatedProgressBar.doneCardsCount;

    if (!isLastCard && typeof nextCardId === 'number') {
      setNewCard(nextCardId);
    }

    if (typeof answeredCardId !== 'number') {
      return;
    }

    answerQuestion(sessionIdParam, answeredCardId, answerCorrectness).then(() => {
      if (isLastCard){
        navigate(`/result?sessionId=${sessionIdParam}`)
      }
    });
  }

  return (
    <>
      <Header title={exam.title} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}}
              onTitleChange={()=>{}} backButtonPage={`/exam-cover?examId=${exam.id}`}/>
      <div className="screenСontent screenContentCentered">
        <Card
          onFlip={handleCardClick}
          card={card}
        />
        {card.isFlipped && <RatingAnswer
          onCorrect={() => {handleAnswer(true)}}
          onFail={() => {handleAnswer(false)}}/>}
      </div>
      <ProgressBar progressBar={progressBar}/>
    </>
  )
}
