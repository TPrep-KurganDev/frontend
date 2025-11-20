import styles from './Notification.module.scss';

type NotificationProps = {
  examName: string;
  nextRepeat: string;
}

export function Notification({examName, nextRepeat}: NotificationProps) {
  return (
    <div className={styles.notification}>
      <div className={styles.examName}>{examName}</div>
      <div className={styles.nextRepeat}>{nextRepeat}</div>
      <div className={styles.buttonNotification}>Не уведомлять</div>
    </div>
  );
}
