import styles from './EditorsMenu.module.scss';
import clsx from 'clsx';
import {useCallback, useEffect, useState} from 'react';
import {getExamEditors, grantEditorRights, revokeUserRights} from '../../api/rights.ts';
import {getUserByEmail, getUserById} from "../../api/users.ts";

export type Editor = {
  avatar: string
  name: string
  id: string
}

type EditorsMenuProps = {
  examId: string | null;
  handler: () => void;
  isOpened: boolean;
  onClose: () => void;
};

async function getEditors(examId: string | null) {
  const res = await getExamEditors(examId)
  console.log(res)
  const userPromises = res.user_id.map(editor_id => getUserById(editor_id));
  const users = await Promise.all(userPromises);
  return users.map((user) => { return {avatar: 'avatar.png', name: user.user_name, id: user.id}; })
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

  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [userByEmail, setUserByEmail] = useState<Editor>({name: '', avatar: 'avatar.png', id: ''});
  const [showUser, setShowUser] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  useEffect(() => {
    if (debouncedValue) {
      console.log('Отправляем запрос для:', debouncedValue);
      tryShowUser(debouncedValue)
    }
    else {
      setShowUser(false)
    }
  }, [debouncedValue]);

  const tryShowUser = async (email: string) => {
    try {
      const user = await getUserByEmail(email)
      if (user.id == localStorage.getItem('userId') || editors.some(editor => editor.id === user.id)) {
        return
      }
      setUserByEmail({...userByEmail, name: user.user_name, id: user.id});
      setShowUser(true);
    }
    catch (e) {
      setShowUser(false);
    }
  }

  const onCrossClick = async (editorId: string) => {
    await revokeUserRights(examId, editorId);
    setEditors(await getEditors(examId));
  }

  const onPlusClick = async (editorId: string) => {
    await grantEditorRights(examId, editorId);
    setShowUser(false);
    setEditors(await getEditors(examId));
  }

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
                  <img
                    className={clsx(styles.rightPart, styles.rightPartCross)}
                    src='kick cross.svg'
                    alt=''
                    onClick={() => {onCrossClick(editor.id)}}
                  />

                </div>
              )
            )}
          </div>


          <div className={styles.search}>
            <img src='search icon.svg'/>
            <input
              type="text"
              placeholder="Введите email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          { showUser && (
            <div className={styles.rightString}>
              <div className={styles.leftPart}>
                <img className={styles.avatar} src='avatar.png' alt=''/>
                <p className={styles.editorName}>{userByEmail.name}</p>
              </div>
              <img
                className={styles.rightPart}
                src='add cross.svg'
                alt=''
                onClick={() => {onPlusClick(userByEmail.id)}}
              />

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
