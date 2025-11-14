import styles from './RatingAnswer.module.scss';

type RatingProps = {
  onCorrect: () => void;
  onFail: () => void;
}

export function RatingAnswer({onCorrect, onFail}: RatingProps){
  return (
    <div className={styles.ratingCard}>
      <span className={styles.title}>Вы правильно ответили?</span>

      <div className={styles.ratingOptions}>
        <div className={styles.ratingOption}>
          <button className={`${styles.ratingButton} ${styles.lightGray}`} onClick={onFail}>
            <img src={"cross.svg"} width="50px"/>
          </button>
          <span className={styles.ratingLabel}>Нет</span>
        </div>
        <div className={styles.ratingOption}>
          <button className={`${styles.ratingButton}  ${styles.lightBlue}`} onClick={onCorrect}>
            <img src={"mark.svg"} width="50px"/>
          </button>
          <span className={styles.ratingLabel}>Да</span>
        </div>
      </div>
    </div>
  );
}
