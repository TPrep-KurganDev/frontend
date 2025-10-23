import {Footer} from '../../components/Footer/Footer.tsx';
import {Card} from '../../components/Card/Card.tsx';
import {footer} from '../../mocks/Footer.ts';
import {questions} from '../../mocks/ListCards.ts';
import {RatingAnswer} from '../../components/RatingAnswer/RatingAnswer.tsx';
import Header from '../../components/Header/Header.tsx';
import {titleExam} from '../../mocks/Header.ts';

export function CardScreen() {
  const currentQuestion = questions[3];
  return (
    <>
      <Header title={titleExam}/>
      <div className="screenСontent">
        <Card
          question={currentQuestion.title}
          answer={currentQuestion.answer}
        />
        <RatingAnswer></RatingAnswer>
      </div>
      <Footer
        footer={footer}
      />
    </>
  )
}
