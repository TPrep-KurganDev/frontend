import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';

export default function ExamScreen() {
  const questions = [
    {id: 1, title: 'Что называется рангом матрицы?', subtitle: 'Ранг матрицы — понятие в линейной алгебре...'},
    {id: 2, title: 'Что называется рангом матрицы?', subtitle: 'Ранг матрицы — понятие в линейной алгебре...'},
    {id: 3, title: 'Что называется рангом матрицы?', subtitle: 'Ранг матрицы — понятие в линейной алгебре...'},
    {id: 4, title: 'Что такое ядро гомоморфизма?', subtitle: 'Ядро гомоморфизма — это множество элементов...'},
    {id: 5, title: 'Что называется рангом матрицы?', subtitle: 'Ранг матрицы — понятие в линейной алгебре...'},
  ];
  const title = 'Экзамен по алгему'

  return (
    <div className="screen">
      <Header title={title}/>

      <div className={styles.list}>
        {questions.map((q) => (
          <div key={q.id} className={styles.item}>
            <div className={styles.itemNumber}>{q.id}</div>
            <div className={styles.listItem}>
              <p className={styles.itemTitle}>{q.title}</p>
              <p className={styles.itemSubtitle}>{q.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
