import Header from '../../components/Header/Header';
import styles from './NoAccessScreen.module.scss';

export default function NoAccessScreen() {
  return (
    <>
      <Header title={''} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}} backButtonPage={'/'}/>
      <div className={styles.error}>
        <img src='lock.svg' alt=''/>
        <div className={styles.header}>У вас нет прав на <br/> просмотр этого теста</div>
      </div>
    </>
  )
}
