import styles from './ProgressBar.module.scss';
import {ProgressBarType} from '../../types/ProgressBarType.ts';
import {ReactElement} from 'react';

type ProgressBarProps = {
  progressBar: ProgressBarType|undefined;
}

export function ProgressBar({progressBar}: ProgressBarProps) {
  const renderProgressSegments = () => {
    const segments: ReactElement[] = [];
    for (let i = 0; i < progressBar!.cardsCount; i++) {
      let segmentClass = styles.segmentPending;
      if (i in progressBar!.cardsProgress) {
        if (progressBar!.cardsProgress[i]){
          if (i == progressBar?.currentCard){
            segmentClass = styles.segmentCompletedCurrent;
          }
          else {
            segmentClass = styles.segmentCompleted;
          }
        }
        else {
          if (i == progressBar?.currentCard){
            segmentClass = styles.segmentErrorCurrent;
          }
          else {
            segmentClass = styles.segmentError;
          }
        }
      } else {
        if (i == progressBar?.currentCard){
          segmentClass = styles.segmentCurrent;
        }
        else {
          segmentClass = styles.segmentPending;
        }
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
          {Object.values(progressBar!.cardsProgress).filter(Boolean).length} из {progressBar!.cardsCount}
        </span>
        <span className={styles.errorsText}>
          Ошибок: {Object.values(progressBar!.cardsProgress).filter(v => !v).length}
        </span>
      </div>
      <div className={styles.segments}>
        {renderProgressSegments()}
      </div>
    </div>
  );
}
