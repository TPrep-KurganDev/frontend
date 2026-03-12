import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

import {useEffect, useRef, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {CardOut, getCardsList} from '../../api/cards.ts';
import {ExamOut, getExam, deleteExam, updateExam} from '../../api/exam.ts';
import {createCard} from '../../api/cards.ts';
import {AppRoute} from '../../const.ts';
import {BottomSheet} from '../../components/BottomSheet/BottomSheet.tsx';
import {AccessToogle} from '../../components/AccessToogle/AccessToogle.tsx';
import {EditorsMenu} from '../../components/EditorsMenu/EditorsMenu.tsx';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';


export default function ExamScreen() {
  const [cards, setCards] = useState<CardOut[]>([]);
  const [searchParams] = useSearchParams();
  const [exam, setExam] = useState<ExamOut>();
  const [examTitle, setExamTitle] = useState('');
  const [bottomScreenOpen, setBottom] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [isRightScreenOpened, setRightScreenOpened] = useState(false);
  const [isEditorScreenOpened, setEditorScreenOpened] = useState(false);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    let cancelled = false;
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    getExam(examIdParam).then((ex) => {
      if (cancelled) {
        return;
      }
      setExam(ex);
      setExamTitle(ex.title);
      setCanEdit(isOnline && ex.creator_id === localStorage.getItem('userId'));
    }).catch(() => {
      navigate(AppRoute.NotFound);
    });

    getCardsList(examIdParam)
      .then((cardsList) => {
        if (cancelled) {
          return;
        }
        setCards(cardsList);
      }).catch(() => {
      navigate(AppRoute.NotFound);
    });

    return () => {
      cancelled = true;
    };
  }, [isOnline, navigate, searchParams]);

  const inputRef = useRef(null);

  const renameClick = () => {
    if (!canEdit) {
      if (!isOnline) {
        notifyOnlineOnly();
      }
      return;
    }

    setInputDisabled(false);
    setBottom(false);
    setTimeout(() => { // @ts-expect-error ignore
      inputRef.current.focus();
    }, 50);
  };

  const renameEnd = () => {
    setInputDisabled(true);
  };

  const createCardClick = () => {
    if (!canEdit) {
      if (!isOnline) {
        notifyOnlineOnly();
      }
      return;
    }

    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    createCard(examIdParam, {question: 'Вопрос', answer: 'Ответ'}).then(
      () => {
        getCardsList(examIdParam, {forceRefresh: true})
          .then(setCards);
      }
    );

  }

  const deleteExamClick = () => {
    if (!canEdit) {
      if (!isOnline) {
        notifyOnlineOnly();
      }
      return;
    }

    deleteExam(exam?.id).then(() => {
      navigate('/exam-list')
    });
  }

  useEffect(() => {
    if (!canEdit || !exam?.id) {
      return;
    }

    const handler = setTimeout(() => {
      updateExam(exam?.id, {title: examTitle});
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [canEdit, exam?.id, examTitle]);

  return (
    <>
      <Header inputDisabled={inputDisabled} title={examTitle} inputRef={inputRef} onInputBlur={renameEnd}
              onTitleChange={setExamTitle} {...(canEdit && {
        imgSrc: 'settingsCard.svg',
        widthImg: '38',
        heightImg: '36',
        onRightImageClick: () => {
          setBottom(true)
        }
      })}
              {...(!isOnline && {
                imgSrc: 'offline.svg',
                widthImg: '38',
                heightImg: '36'
              })}
              backButtonPage={`/exam-cover?examId=${exam?.id}`}/>
      <div className={styles.list}>
        {cards.map((q, index) => (
          <CardListEntry
            key={q.card_id}
            question={q.question}
            answer={q.answer}
            id={(index + 1).toString()}
            onclick={() => {
              navigate(`/card-edit?cardId=${q.card_id}&examId=${searchParams.get('examId')}`);
            }}
          />
        ))}
        {canEdit && <CardListEntry question={''} answer={''} id={'+'} onclick={() => {
          createCardClick()
        }}/>}
        {canEdit &&
          <div key={1000} className={styles.uploadItem} onClick={() => {
            navigate(`/file-upload?examId=${exam?.id}`)
          }}>
            <div className={styles.uploadIcon}>
              <img src='upload button.svg' alt='' width={16}/>
            </div>
            <div className={styles.uploadListItem}>
              <p className={styles.uploadTitle}>Загрузить из файла</p>
            </div>
          </div>
        }
      </div>

      <AccessToogle currentAccess={''} handler={() => {}} isOpened={isRightScreenOpened} onClose={() => setRightScreenOpened(false)}/>
      <EditorsMenu editors={[{avatar:'avatar.png', name:'Беня Салин'}, {avatar:'avatar.png', name:'Беня Салин'}, {avatar:'avatar.png', name:'Беня Салин'}]}
                   handler={() => {}}
                   isOpened={isEditorScreenOpened}
                   onClose={() => {setEditorScreenOpened(false)}}
      />

      <BottomSheet
        open={bottomScreenOpen}
        onClose={() => setBottom(false)}
        buttons={[
          { text: 'Переименовать', onclick: renameClick, color: '#353535' },
          { text: 'Редактировать права доступа', onclick: () => {setRightScreenOpened(true); setBottom(false);}, color: '#353535' },
          { text: 'Назначить редакторов', onclick: () => {setEditorScreenOpened(true); setBottom(false);}, color: '#353535' },
          { text: 'Удалить', onclick: deleteExamClick, color: '#F7474A' }
        ]}
      />
    </>
  );
}
