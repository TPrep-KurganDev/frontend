const exams = [{
  name: 'Зачёт по сетям',
  author: 'автор: К. С.'},
  {
    name: 'Экзамен по матстату',
    author: 'автор: Hlopin'}];import Header from '../../components/Header/Header';
import styles from './ExamListScreen.module.scss';

type ExamListScreenProps = {
  isFavorites : boolean;
}

export function ExamListScreen({isFavorites}: ExamListScreenProps) {
  return (
    <>
      <Header title={isFavorites ? 'Готовлюсь к этим тестам' : 'Мои тесты'}/>
      <div className={styles.examList}>
        {exams.map((exam) => (
          <div className={`${styles.listItem} ${isFavorites ? styles.favorites : ''}`}>
            <div className={styles.name}>{exam.name}</div>
            {isFavorites && <div className={styles.author}>{exam.author}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
