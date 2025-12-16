import Header from '../../components/Header/Header';
import styles from './NotFoundScreen.module.scss';

function NotFoundScreen() {
  return (
    <>
      <Header title={''} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}} backButtonPage={'/'}/>
      <div className={styles.error}>
        <div className={styles.numberError}>404</div>
        <div className={styles.header}>Такой страницы нет</div>
        <div className={styles.text}>Но есть много других полезных страницы</div>
      </div>
    </>
  )
}

export default NotFoundScreen
