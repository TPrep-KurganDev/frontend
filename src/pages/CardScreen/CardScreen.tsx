import {ProgressBar} from '../../components/ProgressBar/ProgressBar.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {useState, useEffect} from 'react';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {answerQuestion, getSession} from '../../api/session.ts';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {getCard} from '../../api/cards.ts';
import {ExamOut, getExam} from "../../api/exam.ts";

export type CardState = {
  isFlipped: boolean,
  question: string,
  answer: string
}

export function CardScreen() {
  const [card, setCard] = useState<CardState>({isFlipped: false, question: '', answer:''});
  const [exam, setExam] = useState<ExamOut>({created_at: '', creator_id: 0, id: 0, title: ''});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleCardClick = () => {
    setCard({...card, isFlipped: !card.isFlipped});
  };

  const [progressBar, setProgressBar] = useState<ProgressBarType>({
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
      setProgressBar((prevProgressBar) => ({
        ...prevProgressBar,
        cardsCount: session.questions.length
      }));
      setCurrentCards(session.questions);
      setNewCard(session.questions[progressBar.doneCardsCount]);
      getExam(session.exam_id).then((exam_res) => {
        setExam(exam_res);
      })
    });
  }, [progressBar.doneCardsCount, sessionIdParam]);



  const setNewCard = (cardId: number) => {
    getCard(cardId).then((new_card) => {
      setCard({isFlipped: false, answer: new_card.answer, question: new_card.question});
    })
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
    setCard({...card, isFlipped: !card.isFlipped});

    setNewCard(currentCards[updatedProgressBar.doneCardsCount]);
    answerQuestion(sessionIdParam, currentCards[updatedProgressBar.doneCardsCount - 1], answerCorrectness).then(() => {
      if (currentCards.length === updatedProgressBar.doneCardsCount){
        navigate(`/result?sessionId=${sessionIdParam}`)
      }
    });
  }

  return (
    <>
      <Header title={exam.title} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}}/>
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
