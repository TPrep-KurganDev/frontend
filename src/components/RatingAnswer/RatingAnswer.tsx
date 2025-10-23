import styles from './RatingAnswer.module.scss';
import {ratingAnswers} from '../../mocks/RatingAnswer.ts';

export function RatingAnswer(){
  return (
    <div className={styles.ratingCard}>
      <span className={styles.title}>{ratingAnswers.title}</span>

      <div className={styles.ratingOptions}>
        {ratingAnswers.rating.map((rating) => (
          <div key={rating.value} className={styles.ratingOption}>
            <button className={`${styles.ratingButton} ${styles[rating.color]}`}>
              {rating.value}
            </button>
            <span className={styles.ratingLabel}>{rating.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
