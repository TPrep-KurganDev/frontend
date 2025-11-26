import {ProgressBar} from '../../components/ProgressBar/ProgressBar.tsx';
import {StartButtons} from '../../components/StartButtons/StartButtons.tsx';
import {progressBar} from '../../mocks/ProgressBar.ts';
import styles from './ResultScreen.module.scss';
import {ResultErrors} from '../../components/ResultErrors/ResultErrors.tsx';
import Header from '../../components/Header/Header.tsx';

export function ResultScreen(){
  return (
    <>
      <Header title='Экзамен по алгему'/>

      <div className={styles.body}>
        <ProgressBar progressBar={progressBar}/>
        <ResultErrors errorsCount={2}/>
        <div className={styles.nextRepeat}>Следующее повторение через 2 часа сегодня в 14:45</div>
        <StartButtons/>
      </div>
    </>
  )
}
