import {Footer} from '../../components/Footer/Footer.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {footer} from '../../mocks/Footer.ts';
import {questions} from '../../mocks/ListCards.ts';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {titleExam} from '../../mocks/Header.ts';
import {useState} from 'react';

export function CardScreen() {
  const currentQuestion = questions[3];
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <Header title={titleExam}/>
      <div className="screenСontent screenContentCentered">
        <Card
          question={currentQuestion.title}
          answer={currentQuestion.answer}
          onFlip={handleCardClick}
          isFlipped={isFlipped}
        />
        {isFlipped && <RatingAnswer/>}
      </div>
      <Footer footer={footer}/>
    </>
  )
}
