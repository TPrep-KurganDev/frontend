import styles from './Header.module.scss';

type HeaderProps = {
  title: string | undefined,
  imgSrc?: string,
  widthImg?: string,
  heightImg?: string,
}

export default function Header({ title, imgSrc, widthImg, heightImg }: HeaderProps) {
  return (
    <div className={styles.header}>
      <img src="Arrow 1.svg" className={styles.backButton} width="23" height="23" alt='backButton'/>
      <h1 className={styles.title}>{title}</h1>
      {imgSrc && <img src={imgSrc} className={styles.settingsButton} width={widthImg} height={heightImg} alt='settingsButton'/>}
    </div>
  );
}
