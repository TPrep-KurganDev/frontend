import { useState } from 'react';
import styles from './RatingAnswer.module.scss';
import {ratingAnswers} from '../../mocks/RatingAnswer.ts';

type RatingAnswerProps = {
  onRatingSelect?: (rating: number) => void;
}

export function RatingAnswer({ onRatingSelect }: RatingAnswerProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);



  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    onRatingSelect?.(rating);
  };

  return (
    <div className={styles.ratingCard}>
      <span className={styles.title}>{ratingAnswers.title}</span>

      <div className={styles.ratingOptions}>
        {ratingAnswers.rating.map((rating) => (
          <div key={rating.value} className={styles.ratingOption}>
            <button
              className={`${styles.ratingButton} ${styles[rating.color]} ${
                selectedRating === rating.value ? styles.selected : ''
              }`}
              onClick={() => handleRatingClick(rating.value)}
            >
              {rating.value}
            </button>
            <span className={styles.ratingLabel}>{rating.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
