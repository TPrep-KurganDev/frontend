import styles from './ExamCover.module.scss';

import Header from '../../components/Header/Header';

import { useEffect, useState } from 'react';
import { getExam, ExamOut } from '../../api/exam';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {getCardsList} from '../../api/cards'
import {AppRoute} from '../../const.ts';
import {getUserById} from '../../api/users'
import {StartButtons} from '../../components/StartButtons/StartButtons.tsx';

export default function ExamCover() {
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const [cardsCount, setCardsCount] = useState<number>(0);
  const [creator, setCreator] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    const examId = Number(examIdParam);

    const fetchData = async () => {
      try {
        const res = await getExam(examId);
        setExam(res);

        const user_res = await getUserById(res.creator_id);
        setCreator(user_res.user_name);

        const cards = await getCardsList(examId);
        setCardsCount(cards.length);
      } catch (e) {
        navigate(AppRoute.NotFound);
      }
    };

    fetchData();
  }, [searchParams]);


  return (
    <>
      <Header title={''} imgSrc={'star.svg'} widthImg="38" heightImg="36"
              inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}}
              backButtonPage={'/'}/>
      <div className="screenСontent screenContentCentered">
        <div className={`${styles.titleBlock} ${styles.roundedBox}`}>
          <p className={styles.title}>{ exam?.title }</p>
          <p className={styles.questionCount} onClick={() => {
            navigate(`/exam?examId=${exam?.id}`);}}>{cardsCount} вопросов</p>
          <p className={styles.author}>автор: {creator}</p>
        </div>
        <StartButtons exam={exam}/>
      </div>
    </>
  );
}
