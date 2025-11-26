import styles from './ProgressBar.module.scss';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {ReactElement} from 'react';

type ProgressBarProps = {
  progressBar: ProgressBarType;
}

export function ProgressBar({progressBar}: ProgressBarProps) {
  const renderProgressSegments = () => {
    const segments: ReactElement[] = [];

    for (let i = 0; i < progressBar.cardsCount; i++) {
      let segmentClass = styles.segmentPending;
      if (i < progressBar.cardsProgress.length) {
        segmentClass = progressBar.cardsProgress[i] ? styles.segmentCompleted : styles.segmentError;
      } else {
        segmentClass = styles.segmentPending;
      }
      segments.push(
        <div key={i} className={`${styles.segment} ${segmentClass}`}/>
      );
    }

    return segments;
  };

  return (
    <div className={styles.progressBar}>
      <div className={styles.info}>
        <span className={styles.progressText}>
          {progressBar.doneCardsCount} из {progressBar.cardsCount}
        </span>
        <span className={styles.errorsText}>
          Ошибок: {progressBar.mistakesCount}
        </span>
      </div>
      <div className={styles.segments}>
        {renderProgressSegments()}
      </div>
    </div>
  );
}
