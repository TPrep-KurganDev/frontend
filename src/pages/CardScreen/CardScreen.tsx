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
import {
  clearPendingSessionStart,
  getPendingSessionStart,
  takePreparedSession,
  takePreparedSessionCards
} from '../../session/pendingSessionStart';
import {toast} from 'react-hot-toast';

export type CardState = {
  isFlipped: boolean,
  question: string,
  answer: string
}

export function CardScreen() {
  const [card, setCard] = useState<CardState>({isFlipped: false, question: '', answer:''});
  const [exam, setExam] = useState<ExamOut>({created_at: '', creator_id: 0, id: 0, title: ''});
  const [currentCards, setCurrentCards] = useState<number[]>([]);
  const [pendingError, setPendingError] = useState('');
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
  const pendingStartId = searchParams.get('pendingStart');

  useEffect(() => {
    if (sessionIdParam || !pendingStartId) {
      return;
    }

    const pendingStart = getPendingSessionStart(pendingStartId);
    if (!pendingStart) {
      setPendingError('Не удалось открыть тест. Запустите его снова.');
      return;
    }

    let cancelled = false;
    pendingStart
      .then((session) => {
        if (cancelled) {
          return;
        }

        clearPendingSessionStart(pendingStartId);
        navigate(`/session?sessionId=${session.id}`, {replace: true});
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        clearPendingSessionStart(pendingStartId);
        const maybeError = error as { code?: string };
        if (maybeError.code === 'OFFLINE_SESSION_DATA_UNAVAILABLE') {
          setPendingError('Для офлайна сначала откройте вопросы этого экзамена онлайн');
          return;
        }

        setPendingError('Не удалось начать прохождение');
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, pendingStartId, sessionIdParam]);

  useEffect(() => {
    if (!pendingError) {
      return;
    }

    toast.error(pendingError);
  }, [pendingError]);

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

    const applySession = (
      session: {
        answers?: Record<number, boolean>;
        questions: number[];
        exam_id: number;
        offline_cards?: Record<number, { question: string; answer: string }>;
      },
      seededCards: Record<number, { question: string; answer: string }>
    ) => {
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
      offlineCardsByIdRef.current = {
        ...seededCards,
        ...(session.offline_cards ?? {})
      };
      setNewCard(session.questions[doneCardsCount], offlineCardsByIdRef.current);
      getExam(session.exam_id).then((exam_res) => {
        setExam(exam_res);
      }).catch(() => undefined);
    };

    const preparedSession = takePreparedSession(sessionIdParam);
    if (preparedSession) {
      applySession(preparedSession, takePreparedSessionCards(sessionIdParam));
      return;
    }

    getSession(sessionIdParam)
      .then((session) => {
        applySession(session, takePreparedSessionCards(sessionIdParam));
      })
      .catch(() => undefined);
  }, [sessionIdParam, setNewCard]);

  if (!sessionIdParam) {
    return (
      <>
        <Header title='Загрузка теста...' inputDisabled={true} inputRef={undefined} onInputBlur={() => {
        }}
                onTitleChange={() => {
                }} backButtonPage={'/'} />
        <div className='screenСontent screenContentCentered'>
          <p>{pendingError || 'Открываем тест...'}</p>
        </div>
      </>
    );
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
