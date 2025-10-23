import styles from './Footer.module.scss';
import {FooterCard} from '../../types/FooterCard.ts';
import {ReactElement} from 'react';

type FooterProps = {
  footer: FooterCard;
}

export function Footer({footer}: FooterProps) {
  const renderProgressSegments = () => {
    const segments: ReactElement[] = [];

    for (let i = 0; i < footer.cardsCount; i++) {
      let segmentClass = styles.segmentPending;
      if (i < footer.cardsProgress.length) {
        segmentClass = footer.cardsProgress[i] ? styles.segmentCompleted : styles.segmentError;
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
    <div className={styles.footer}>
      <div className={styles.info}>
        <span className={styles.progressText}>
          {footer.doneCardsCount} из {footer.cardsCount}
        </span>
        <span className={styles.errorsText}>
          Ошибок: {footer.mistakesCount}
        </span>
      </div>
      <div className={styles.progressBar}>
        {renderProgressSegments()}
      </div>
    </div>
  );
}
