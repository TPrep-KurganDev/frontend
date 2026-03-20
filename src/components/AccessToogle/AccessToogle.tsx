import styles from './AccessToogle.module.scss';
import clsx from 'clsx';

type AccessToggleProps = {
  currentAccess: string;
  handler: (access: string) => void;
  isOpened: boolean;
  onClose: () => void;
};

export const AccessToogle: React.FC<AccessToggleProps> = ({currentAccess, handler, isOpened, onClose}) => {
  return (
    <div className={clsx(styles.overlay, { [styles.hidden]: !isOpened })} onClick={() => onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Права доступа</div>
        <div className={styles.rightsBlock}>
          <div className={styles.rightString} onClick={() => {handler('personal')}}>
            <img
              className={clsx(styles.chooseMark, { [styles.invisible]: currentAccess != 'personal' })}
              src='choose mark.svg'
            />
            <p>Только для меня</p>
          </div>
          <div className={styles.rightString} onClick={() => {handler('link')}}>
            <img
              className={clsx(styles.chooseMark, { [styles.invisible]: currentAccess != 'link' })}
              src='choose mark.svg'
            />
            <p>По ссылке</p>
          </div>
          <div className={styles.rightString} onClick={() => {handler('default')}}>
            <img
              className={clsx(styles.chooseMark, { [styles.invisible]: currentAccess != 'default' })}
              src='choose mark.svg'
            />
            <p>Публичный доступ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
