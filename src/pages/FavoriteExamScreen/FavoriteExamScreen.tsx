const exams = [{
  name: 'Зачёт по сетям',
  author: 'автор: К. С.'},
  {
    name: 'Экзамен по матстату',
    author: 'автор: Hlopin'}];
import Header from '../../components/Header/Header';
import styles from './FavoriteExamListScreen.module.scss';

export function FavoriteExamListScreen() {
  return (
    <>
      <Header title={'Готовлюсь к этим тестам'}/>
      <div className={styles.examList}>
        {exams.map((exam) => (
          <div className={styles.listItem}>
            <div className={styles.itemTitle}>{exam.name}</div>
            <div className={styles.itemSubtitle}>{exam.author}</div>
          </div>
        ))}
      </div>
    </>
  )
}
