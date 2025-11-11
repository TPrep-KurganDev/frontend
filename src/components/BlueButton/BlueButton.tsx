import styles from './BlueButton.module.scss';

export function BlueButton({ title }: { title: string }){
  return (
    <button type="submit" className={styles.blueButton}>{title}</button>
  )
}
