import styles from './AccessToogle.module.scss';
import clsx from 'clsx';

type AccessToggleProps = {
  currentAccess: string | undefined;
  handler: (access: string) => void;
  isOpened: boolean;
  onClose: () => void;
};

export const AccessToogle: React.FC<AccessToggleProps> = ({currentAccess: _currentAccess, handler: _handler, isOpened, onClose}) => {
  return (
    <div className={clsx(styles.overlay, { [styles.hidden]: !isOpened })} onClick={() => onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Права доступа</div>
        <div className={styles.rightsBlock}>
          <div className={styles.rightString} onClick={() => {_handler('personal')}}>
            <img
              className={clsx(styles.chooseMark, { [styles.invisible]: _currentAccess != 'personal' })}
              src='choose mark.svg'
            />
            <p>Только для меня</p>
          </div>
          <div className={styles.rightString} onClick={() => {_handler('link')}}>
            <img
              className={clsx(styles.chooseMark, { [styles.invisible]: _currentAccess != 'link' })}
              src='choose mark.svg'
            />
            <p>По ссылке</p>
          </div>
          <div className={styles.rightString} onClick={() => {_handler('default')}}>
            <img
              className={clsx(styles.chooseMark, { [styles.invisible]: _currentAccess != 'default' })}
              src='choose mark.svg'
            />
            <p>Публичный доступ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
