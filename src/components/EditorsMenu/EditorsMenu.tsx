import styles from './EditorsMenu.module.scss';
import clsx from 'clsx';

export type Editor = {
  avatar: string
  name: string
}

type EditorsMenuProps = {
  editors: Editor[];
  handler: () => void;
  isOpened: boolean;
  onClose: () => void;
};

export const EditorsMenu: React.FC<EditorsMenuProps> = ({editors, handler, isOpened, onClose}) => {
  return (
    <div className={clsx(styles.overlay, { [styles.hidden]: !isOpened })} onClick={() => onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Редакторы</div>
        <div className={styles.rightsBlock}>
          <div className={styles.currentEditors}>
            {editors.map((editor) =>
              (
                <div className={styles.rightString}>
                  <div className={styles.leftPart}>
                    <img className={styles.avatar} src={editor.avatar} alt=''/>
                    <p className={styles.editorName}>{editor.name}</p>
                  </div>
                  <img className={styles.rightPart} src='kick cross.svg' alt=''/>

                </div>
              )
            )}
          </div>


          <div className={styles.search}>
            <img src='search icon.svg' />
            <input type="text" placeholder="Введите email"/>
          </div>

          <div className={styles.rightString}>
            <div className={styles.leftPart}>
              <img className={styles.avatar} src='avatar.png' alt=''/>
              <p className={styles.editorName}>Рюрий Омашов</p>
            </div>
            <img className={styles.rightPart} src='add cross.svg' alt=''/>

          </div>
        </div>

      </div>
    </div>
  );
};
