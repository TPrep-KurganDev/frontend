import styles from './Header.module.scss';

export default function Header({ title }: { title: string }) {
  return (
    <div className={styles.header}>
      <img src="Arrow 1.svg" className={styles.backButton} width="23" height="23"/>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
