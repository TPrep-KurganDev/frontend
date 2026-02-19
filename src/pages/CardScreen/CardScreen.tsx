import {ProgressBar} from '../../components/ProgressBar/ProgressBar.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {useEffect, useState} from 'react';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {answerQuestion, getSession} from '../../api/session.ts';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {CardOut, getCard} from '../../api/cards.ts';
import {ExamOut, getExam} from '../../api/exam.ts';

export type CardState = {
  isFlipped: boolean,
  question: string,
  answer: string
}

export function CardScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionIdParam = searchParams.get('sessionId');

  if (!sessionIdParam) return null;

  const [card, setCard] = useState<CardState>({
    isFlipped: false,
    question: '',
    answer: '',
  });

  const [exam, setExam] = useState<ExamOut>({
    created_at: '',
    creator_id: 0,
    id: 0,
    title: '',
  });

  const [currentCards, setCurrentCards] = useState<CardOut[]>([]);
  const [currentCardNum, setCurrentCardNum] = useState(0);

  const [progressBar, setProgressBar] = useState<ProgressBarType>({
    mistakesCount: 0,
    cardsCount: 0,
    doneCardsCount: 0,
    cardsProgress: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const session = await getSession(sessionIdParam);

      setProgressBar((prev) => ({
        ...prev,
        cardsCount: session.questions.length,
      }));

      const cards = await Promise.all(
        session.questions.map((id: number) => getCard(id))
      );

      setCurrentCards(cards);

      const examData = await getExam(session.exam_id);
      setExam(examData);
    };

    loadData();
  }, [sessionIdParam]);

  useEffect(() => {
    if (currentCards.length === 0) return;
    if (currentCardNum >= currentCards.length) return;

    const newCard = currentCards[currentCardNum];

    setCard({
      isFlipped: false,
      question: newCard.question,
      answer: newCard.answer,
    });
  }, [currentCardNum, currentCards]);


  const handleCardClick = () => {
    setCard((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
  };

  const handleAnswer = async (answerCorrectness: boolean) => {
    const currentCard = currentCards[currentCardNum];

    // Обновляем progressBar БЕЗ мутации
    setProgressBar((prev) => ({
      ...prev,
      doneCardsCount: prev.doneCardsCount + 1,
      mistakesCount: answerCorrectness
        ? prev.mistakesCount
        : prev.mistakesCount + 1,
      cardsProgress: [...prev.cardsProgress, answerCorrectness],
    }));

    await answerQuestion(
      sessionIdParam,
      currentCard.card_id,
      answerCorrectness
    );

    const nextIndex = currentCardNum + 1;

    if (nextIndex >= currentCards.length) {
      navigate(`/result?sessionId=${sessionIdParam}`);
      return;
    }

    setCurrentCardNum(nextIndex);
  };

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
