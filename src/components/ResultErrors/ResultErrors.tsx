import styles from './ResultErrors.module.scss';

type ResultErrorsProps = {
  errorsCount: number;
}

export function ResultErrors({errorsCount}: ResultErrorsProps) {
  const hasErrors = errorsCount > 0;
  const message = hasErrors
    ? `Ошибок: ${errorsCount}`
    : 'Тест пройден без ошибок!';

  return (

    <div className={hasErrors ? styles.resultErrors : styles.yellowButton}>
      <div className={`${styles.errorsCount} ${hasErrors ? styles.color : ''}`}>{message}</div>

      {hasErrors && <>
        <div className={`${styles.placeError} ${styles.color}`}>в вопросах:</div>
        <div className={styles.errors}>
          <div className={`${styles.error} ${styles.color}`}>2. Что такое ядро гомоморфизма?</div>
          <div className={`${styles.error} ${styles.color}`}>12. Что называют рангом матрицы?</div>
        </div>
      </>}
    </div>
  )
}
