import styles from './ResultErrors.module.scss';
import {getCard} from '../../api/cards'
import {useEffect, useState} from 'react';

type ResultErrorsProps = {
  mistakesId: number[]
}

export function ResultErrors({mistakesId}: ResultErrorsProps) {
  const hasErrors = mistakesId.length > 0;
  const message = hasErrors
    ? `Ошибок: ${mistakesId.length}`
    : 'Тест пройден без ошибок!';

  const [mistakes, setMistakes] = useState<string[]>(['Было']);

  useEffect(() => {
    async function loadMistakes() {
      const cards = await Promise.all(
        mistakesId.map(id => getCard(id))
      );

      const mistakes = cards.map((card, index) =>
        `${mistakesId[index]}. ${card.question}`
      );

      setMistakes(mistakes);
    }

    loadMistakes();
  }, [mistakesId]);


  return (

    <div className={hasErrors ? styles.resultErrors : styles.yellowButton}>
      <div className={`${styles.errorsCount} ${hasErrors ? styles.color : ''}`}>{message}</div>

      {hasErrors && <>
        <div className={`${styles.placeError} ${styles.color}`}>в вопросах:</div>
        <div className={styles.errors}>
          {mistakes!.map((mistake, q) => (
            <div key={q} className={`${styles.error} ${styles.color}`}>{mistake}</div>
          ))}
        </div>
      </>}
    </div>
  )
}
