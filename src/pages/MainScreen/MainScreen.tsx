import styles from './MainScreen.module.scss'
import {Notification} from '../../components/Notification/Notification.tsx';
import {createExam} from '../../api/exam'
import {useNavigate} from 'react-router-dom';

export function MainScreen() {
  const navigate = useNavigate();
  const createExamClick = () => {
    createExam('Новый экзамен').then((res) => {navigate(`/exam-cover?examId=${res.id}`)});
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.user}>
          <img className={styles.avatar} width={43} height={43} src="avatar.png"/>
          <div className={styles.name}>Роман</div>
        </div>
        <div className={styles.buttonsHeader}>
          <div className={styles.buttonHeader} onClick={() => {navigate('/favourite-exam-list')}}>
            <img className={styles.imageButtonHeader} width={40} height={40} src='starActive.svg'/>
            <div className={styles.textButtonHeader}>Закреплённые</div>
          </div>
          <div className={styles.buttonHeader} onClick={() => {navigate('/exam-list')}}>
            <img className={styles.imageButtonHeader} src='createdTests.svg' width={38} height={38}/>
            <div className={styles.textButtonHeader}>Созданные</div>
          </div>
        </div>
      </header>
      <div className={styles.buttonsBody}>
        <div className={`${styles.buttonBody} ${styles.yellowButton}`} onClick={createExamClick}>
          <img width={25} height={25} src='createTest.svg'/>
          <div className={styles.textButtonBody}>Создать тест</div>
        </div>
        <div className={styles.buttonBody}>
          <img width={30} height={30} src='findTest.svg'/>
          <div className={styles.textButtonBody}>Найти тест</div>
        </div>
      </div>
      <Notification examName='Тест по алгему' nextRepeat='Следующее повторение через 21 минуту
сегодня в 14:51'/>
      <Notification examName='Экзамен ПДД' nextRepeat='Следующее повторение через 7 часов 31 минуту
завтра в 8:14'/>
    </>

  );
}
