import styles from './ExamCreateScreen.module.scss';
import Header from '../../components/Header/Header';

export function ExamCreateScreen() {
  return (
    <>
      <Header title={''} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={() => {}} backButtonPage={null}/>
      <div className={styles.content}>
        <div className={styles.nameText}>Название</div>
        <div className={styles.name}>Новый тест</div>
        <div className={styles.rightsText}>Права доступа</div>
        <div className={styles.rights}>Только для меня</div>
        <div className={styles.loadButton}>
          <span className={styles.loadText}>Загрузить из файла</span>
          <img className={styles.loadIcon} src="load.svg" alt=""/>
        </div>
        <div className={styles.scanButton}>
          <span className={styles.scanText}>Отсканировать фото</span>
          <img className={styles.scanIcon} src="scan.svg" alt=""/>
        </div>
      </div>
    </>
  )
}
