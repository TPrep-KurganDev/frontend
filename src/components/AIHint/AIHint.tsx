import { useState, useEffect } from 'react';
import styles from './AIHint.module.scss';
import clsx from "clsx";

const HINT_SHOWN_COUNT_KEY = 'ai_hint_shown_count'

export const AIHint = () => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintShownCount = Number(localStorage.getItem(HINT_SHOWN_COUNT_KEY));
    if (hintShownCount < 3) {
      setShowHint(true);
      setTimeout(() => {
        localStorage.setItem(HINT_SHOWN_COUNT_KEY, String(hintShownCount + 1));
        setShowHint(false)
      }, 4000);
    }
  }, []);

  return (
    <div className={clsx(styles.hintBlock, {
      [styles.opacity]: !showHint
    })}>
      <div className={styles.hint}>
        <div className={styles.hintImgBox}>
          <img src='hint arrow.svg'/>
        </div>
        <p>Нажмите, чтобы заполнить<br/>поле с помощью ИИ</p>
      </div>
    </div>
  );
};
