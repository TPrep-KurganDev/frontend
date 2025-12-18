import styles from './ExamCover.module.scss';

import Header from '../../components/Header/Header';
import {useEffect, useState} from 'react';
import {getExam, pinExam, unpinExam, getPinnedExams, ExamOut} from '../../api/exam';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {getCardsList} from '../../api/cards';
import {AppRoute} from '../../const';
import {getUserById} from '../../api/users';
import {StartButtons} from '../../components/StartButtons/StartButtons';
import { Toaster, toast } from 'react-hot-toast';
// import {api} from '../../api/api';

export default function ExamCover() {
  const [searchParams] = useSearchParams();
  const [cardsCount, setCardsCount] = useState(0);
  const [creator, setCreator] = useState('');
  const [starImage, setStarImage] = useState('star.svg');
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamOut | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) {
      navigate(AppRoute.NotFound);
      return;
    }

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

  useEffect(() => {
    getPinnedExams(Number(localStorage.getItem('userId'))).then((res) => {
      for (const i of res){
        if (i.id == exam?.id){
          setStarImage('starActive.svg');
          return;
        }
      }
      setStarImage('star.svg');
    });
  }, [exam?.id]);

  const changePinState = () => {
    if (starImage == 'star.svg'){
      pinExam(exam?.id).then(() => {
        setStarImage('starActive.svg');
      });
    }
    else {
      unpinExam(exam?.id).then(() => {
        setStarImage('star.svg');
      });
    }
  }

  const handleShareClick = async (
    e: React.MouseEvent<HTMLImageElement>
  ) => {
    e.stopPropagation();

    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка скопирована');
    } catch (err) {
      toast.error('Не удалось скопировать ссылку');
      console.error(err);
    }
  };


  return (
    <>
      <Header title={''} imgSrc={starImage} widthImg="38" heightImg="36"
              inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}}
              backButtonPage={'/'} onRightImageClick={() => {changePinState()}}/>
      <div className="screenСontent screenContentCentered">
        <div className={`${styles.titleBlock} ${styles.roundedBox}`} onClick={() => navigate(`/exam?examId=${exam?.id}`)}>
          <p className={styles.title}>{exam?.title}</p>
          <p className={styles.questionCount}>
            {cardsCount} вопросов
          </p>
          <p className={styles.author}>автор: {creator}</p>
          <div className={styles.shareButton} onClick={handleShareClick}>
            <img
              src="../../public/share2.svg"
              width='25'
            />
          </div>
        </div>
        <StartButtons exam={exam} cardsCount={cardsCount}/>
        {/*<button disabled={testLoading} onClick={handleTestNotification}>*/}
        {/*  {testLoading ? 'Запрос отправляется...' : 'Запланировать уведомления'}*/}
        {/*</button>*/}
      </div>
      <Toaster position="top-center" />
      <div className={styles.bottomGap}></div>
    </>
  );
}
