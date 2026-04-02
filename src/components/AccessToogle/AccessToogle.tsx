import styles from './AccessToogle.module.scss';
import clsx from 'clsx';

type AccessToggleProps = {
  currentAccess: string;
  handler: () => void;
  isOpened: boolean;
  onClose: () => void;
};

export const AccessToogle: React.FC<AccessToggleProps> = ({currentAccess: _currentAccess, handler: _handler, isOpened, onClose}) => {
  return (
    <div className={clsx(styles.overlay, { [styles.hidden]: !isOpened })} onClick={() => onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Права доступа</div>
        <div className={styles.rightsBlock}>
          <div className={styles.rightString}>
            <img className={styles.chooseMark} src='choose mark.svg'/>
            <p>Только для меня</p>
          </div>
          <div className={styles.rightString}>
            <img className={styles.chooseMark} src='choose mark.svg'/>
            <p>По ссылке</p>
          </div>
          <div className={styles.rightString}>
            <img className={styles.chooseMark} src='choose mark.svg'/>
            <p>Публичный доступ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
