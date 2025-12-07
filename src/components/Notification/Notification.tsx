import styles from './Notification.module.scss';

type NotificationProps = {
  examName: string;
  nextRepeat: string;
  onDelete?: () => void;
}

export function Notification({examName, nextRepeat, onDelete}: NotificationProps) {
  return (
    <div className={styles.notification}>
      <div className={styles.examName}>{examName}</div>
      <div className={styles.nextRepeat}>{nextRepeat}</div>
      <div className={styles.buttonNotification} onClick={onDelete}>Не уведомлять</div>
    </div>
  );
}
