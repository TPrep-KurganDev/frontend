const exams = ['Экзамен по алгему', 'Вопросы на собеседовании в Контур', 'Новые вопросы ПДД', 'Экзамен по матанализу'];
import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

export function ExamListScreen() {
  return (
    <>
      <Header title={'Мои тесты'}/>
      <div className={styles.examList}>
        {exams.map((exam: string) => (<div className={styles.button}>{exam}</div>))}
      </div>
    </>
  )
}
