import styles from './EditorsMenu.module.scss';
import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {getExamEditors} from '../../api/rights.ts';
import {getUserById} from "../../api/users.ts";

export type Editor = {
  avatar: string
  name: string
}

type EditorsMenuProps = {
  examId: string | null;
  handler: () => void;
  isOpened: boolean;
  onClose: () => void;
};

async function getEditors(examId: string | null) {
  const res = await getExamEditors(examId)
  const userPromises = res.user_id.map(editor_id => getUserById(editor_id));
  const users = await Promise.all(userPromises);
  return users.map((user) => { return {avatar: 'avatar.png', name: user.user_name}; })
  // return [, {avatar: 'avatar.png', name: 'Беня Салин'}]
}

export const EditorsMenu: React.FC<EditorsMenuProps> = ({examId, handler, isOpened, onClose}) => {
  const [editors, setEditors] = useState<Editor[]>([])
  useEffect(() => {
    getEditors(examId).then((res) => {
        setEditors(res);
      }
    )
  }, [examId]);
  return (
    <div className={clsx(styles.overlay, {[styles.hidden]: !isOpened})} onClick={() => onClose()}>
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
                  <img className={clsx(styles.rightPart, styles.rightPartCross)} src='kick cross.svg' alt=''/>

                </div>
              )
            )}
          </div>


          <div className={styles.search}>
            <img src='search icon.svg'/>
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
