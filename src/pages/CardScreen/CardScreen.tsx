import {ProgressBar} from '../../components/ProgressBar/ProgressBar.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {useEffect, useState} from 'react';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {answerQuestion, ExamSessionResponse, getSession} from '../../api/session.ts';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {CardOut, getCard} from '../../api/cards.ts';
import {ExamOut, getExam} from '../../api/exam.ts';
import styles from './CardScreen.module.scss';


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

  const [currentSession, setCurrentSession] = useState<ExamSessionResponse>();

  const [progressBar, setProgressBar] = useState<ProgressBarType>({
    mistakesCount: 0,
    cardsCount: 0,
    doneCardsCount: 0,
    cardsProgress: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const session = await getSession(sessionIdParam);
      setCurrentSession(session)

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
    setProgressBar((prev) => ({
      ...prev,
      currentCard: currentCardNum
    }));
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
    setProgressBar((prev) => ({
      ...prev,
      cardsProgress: {...prev.cardsProgress, [currentCardNum]: answerCorrectness}
    }));
    await answerQuestion(
      sessionIdParam,
      currentSession?.questions[currentCardNum] as number,
      answerCorrectness
    );

    let nextIndex = -1;
    const cardsCount = currentCards.length;
    for (let i = (currentCardNum + 1) % cardsCount; i != currentCardNum; i = (i + 1)  % cardsCount) {
      if (!(i in progressBar.cardsProgress)){
        nextIndex = i;
        break
      }
    }
    if (nextIndex == -1) {
      navigate(`/result?sessionId=${sessionIdParam}`);
      return;
    }

    setCurrentCardNum(nextIndex);
  };

  const handleNextClick = () => {
    const l = Math.min(currentCardNum + 1, currentCards.length);
    setCurrentCardNum(l);
  }

  const handlePreviousClick = () => {
    setCurrentCardNum(Math.max(currentCardNum - 1, 0));
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
      <div className={styles.arrowSection}>
        <div className={styles.arrow} onClick={handlePreviousClick}><img src="left arrow.svg"/><p>Предыдущий</p></div>
        <div className={styles.arrow} onClick={handleNextClick}><p>Следующий</p><img src="right arrow.svg"/></div>
      </div>
      <ProgressBar progressBar={progressBar}/>
    </>
  )
}
