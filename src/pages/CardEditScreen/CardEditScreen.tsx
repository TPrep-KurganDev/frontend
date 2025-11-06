import Header from '../../components/Header/Header.tsx';
import styles from './CardEditScreen.module.scss';

export function CardEditScreen() {
  return (
    <>
      <Header title={'Вопрос 2'} imgSrc='deleteCard.svg' widthImg="38" heightImg="30"/>
      <div className={styles.question}>Текст вопроса</div>
      <div className={styles.answer}>Текст ответа</div>
    </>
  )
}
