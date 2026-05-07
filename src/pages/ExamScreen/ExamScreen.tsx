import styles from './ExamScreen.module.scss';

import Header from '../../components/Header/Header';
import {CardListEntry} from '../../components/CardListEntry/CardListEntry.tsx';

import {ChangeEvent, useEffect, useRef, useState} from 'react';
import {useSearchParams, useNavigate, useLocation} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import {CardOut, createCardsFromOcr, getCardsList} from '../../api/cards.ts';
import {ExamOut, getExam, deleteExam, updateExam} from '../../api/exam.ts';
import {createCard} from '../../api/cards.ts';
import {AppRoute} from '../../const.ts';
import {BottomSheet} from '../../components/BottomSheet/BottomSheet.tsx';
import {AccessToogle} from '../../components/AccessToogle/AccessToogle.tsx';
import {EditorsMenu} from '../../components/EditorsMenu/EditorsMenu.tsx';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';
import {getExamEditors} from '../../api/rights.ts';
import {extractApiErrorMessage} from '../../utils/extractApiErrorMessage';
import {pluralizeRu} from '../../utils/pluralizeRu';
import {
  collectOcrFilesFromDirectory,
  probeLocalOcrBridge,
  supportsDirectoryPicker,
  type OcrUploadFile,
  uploadOcrFolder
} from '../../api/localOcr';
import {
  buildCardEditPath,
  buildExamCoverPath,
  buildFileUploadPath,
  getBackPage,
  getCurrentLocationPath
} from '../../utils/backNavigation';

const EMPTY_FOLDER_ERROR = 'В выбранной папке нет файлов. Выберите папку, где лежат изображения для OCR.';
const FOLDER_OCR_UNAVAILABLE_ERROR = 'Загрузка папки с изображениями недоступна в текущей сборке приложения.';
const READ_FOLDER_STATUS = 'Читаю файлы из папки...';
const UPLOAD_FOLDER_STATUS = 'Загружаю папку с изображениями...';
const STOPPING_STATUS = 'Сканирование останавливается...';
const STOPPED_STATUS = 'Сканирование остановлено';

type FolderFiles = FileList | File[] | OcrUploadFile[];

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeAbortError = error as {
    name?: string;
    code?: string;
  };

  return maybeAbortError.name === 'CanceledError' || maybeAbortError.code === 'ERR_CANCELED';
}

function countFolderFiles(files: FolderFiles): number {
  return Array.from(files as ArrayLike<File | OcrUploadFile>).length;
}

function getOcrSuccessMessage(createdCards: number, failedImages: number): string {
  const cardsLabel = pluralizeRu(createdCards, ['карточка', 'карточки', 'карточек']);

  if (failedImages > 0) {
    return `Добавлено ${createdCards} ${cardsLabel}, ошибок: ${failedImages}`;
  }

  return `Добавлено ${createdCards} ${cardsLabel}`;
}

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
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [isFolderOcrAvailable, setIsFolderOcrAvailable] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const scanAbortControllerRef = useRef<AbortController | null>(null);
  const currentExamPath = getCurrentLocationPath(location);
  const backButtonPage = getBackPage(searchParams, exam?.id ? buildExamCoverPath(exam.id) : AppRoute.Main);

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
      getExamEditors(examIdParam).then((editors) => {
        setCanEdit(isOnline && (ex.creator_id === localStorage.getItem('userId') || editors.user_id.some(editor_id => editor_id === localStorage.getItem('userId'))));
      })
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

  useEffect(() => {
    const input = folderInputRef.current;
    if (!input) {
      return;
    }

    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    probeLocalOcrBridge(controller.signal)
      .then((isAvailable) => {
        setIsFolderOcrAvailable(isAvailable);
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return;
        }

        setIsFolderOcrAvailable(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      scanAbortControllerRef.current?.abort();
    };
  }, []);

  const finishOcrRun = (controller?: AbortController | null, nextStatusText = '') => {
    if (!controller || scanAbortControllerRef.current === controller) {
      scanAbortControllerRef.current = null;
    }

    setIsOcrRunning(false);
    setOcrStatusText(nextStatusText);
  };

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

  const handleFolderPickClick = () => {
    if (!canEdit) {
      if (!isOnline) {
        notifyOnlineOnly();
      }
      return;
    }

    if (isOcrRunning) {
      return;
    }

    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }

    if (!isFolderOcrAvailable) {
      toast.error(FOLDER_OCR_UNAVAILABLE_ERROR);
      return;
    }

    if (!supportsDirectoryPicker()) {
      folderInputRef.current?.click();
      return;
    }

    void (async () => {
      let controller: AbortController | null = null;
      let handedOffToScan = false;
      let pendingStatusText = '';

      try {
        const directoryHandle = await window.showDirectoryPicker?.({mode: 'read'});
        if (!directoryHandle) {
          return;
        }

        controller = new AbortController();
        scanAbortControllerRef.current = controller;
        setIsOcrRunning(true);
        setOcrStatusText(READ_FOLDER_STATUS);

        const files = await collectOcrFilesFromDirectory(directoryHandle, controller.signal);
        handedOffToScan = true;
        await handleFolderFiles(files, controller);
      } catch (error) {
        if (isAbortError(error)) {
          pendingStatusText = STOPPED_STATUS;
          return;
        }

        toast.error(extractApiErrorMessage(error, 'Не удалось прочитать выбранную папку'));
      } finally {
        if (!handedOffToScan) {
          finishOcrRun(controller, pendingStatusText);
        }
      }
    })();
  };

  const handleFolderFiles = async (
    files: FolderFiles,
    controller: AbortController = new AbortController()
  ) => {
    if (countFolderFiles(files) === 0) {
      toast.error(EMPTY_FOLDER_ERROR);
      finishOcrRun(controller);
      return;
    }

    if (!isOnline) {
      notifyOnlineOnly();
      finishOcrRun(controller);
      return;
    }

    if (!isFolderOcrAvailable) {
      toast.error(FOLDER_OCR_UNAVAILABLE_ERROR);
      finishOcrRun(controller);
      return;
    }

    const examIdParam = searchParams.get('examId');
    if (!examIdParam) {
      finishOcrRun(controller);
      return;
    }

    scanAbortControllerRef.current = controller;
    setIsOcrRunning(true);
    setOcrStatusText(UPLOAD_FOLDER_STATUS);

    try {
      const uploadResult = await uploadOcrFolder(files, controller.signal);

      let processedImages = 0;
      let failedImages = 0;
      let createdCards = 0;
      let firstErrorMessage = '';

      for (const imageName of uploadResult.imageNames) {
        if (controller.signal.aborted) {
          throw new DOMException('The operation was aborted.', 'AbortError');
        }

        processedImages += 1;
        setOcrStatusText(`Распознаю изображения: ${processedImages} из ${uploadResult.imageNames.length}`);

        try {
          const nextCards = await createCardsFromOcr(examIdParam, imageName, controller.signal);
          createdCards += nextCards.length;
        } catch (error) {
          if (isAbortError(error)) {
            throw error;
          }

          failedImages += 1;
          if (!firstErrorMessage) {
            firstErrorMessage = extractApiErrorMessage(error, 'Не удалось распознать одно из изображений');
          }
        }
      }

      if (createdCards === 0) {
        toast.error(firstErrorMessage || 'Не удалось создать карточки из выбранной папки');
        finishOcrRun(controller);
        return;
      }

      const cardsList = await getCardsList(examIdParam, {forceRefresh: true});
      setCards(cardsList);
      toast.success(getOcrSuccessMessage(createdCards, failedImages));
      finishOcrRun(controller);
    } catch (error) {
      if (isAbortError(error)) {
        finishOcrRun(controller, STOPPED_STATUS);
        return;
      }

      toast.error(extractApiErrorMessage(error, 'Не удалось обработать выбранную папку'));
      finishOcrRun(controller);
    }
  };

  const handleFolderSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    event.target.value = '';

    if (!files) {
      toast.error('Не удалось прочитать выбранную папку. Попробуйте выбрать её ещё раз.');
      return;
    }

    await handleFolderFiles(files);
  };

  const handleCancelScanClick = () => {
    const controller = scanAbortControllerRef.current;
    if (!controller) {
      return;
    }

    controller.abort();
    setOcrStatusText(STOPPING_STATUS);
  };

  const changeScope = (access: string) => {
    updateExam(exam?.id, { title: exam?.title, scope: access });
    setRightScreenOpened(false);
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
      updateExam(exam?.id, {title: examTitle, scope: exam.scope});
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [canEdit, exam?.id, examTitle]);

  const isScanDisabled = isOcrRunning || !canEdit || !isOnline;

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
              backButtonPage={backButtonPage}/>
      <div className={styles.list}>
        {cards.map((q, index) => (
          <CardListEntry
            key={q.card_id}
            question={q.question}
            answer={q.answer}
            id={(index + 1).toString()}
            onclick={() => {
              navigate(buildCardEditPath(q.card_id, searchParams.get('examId'), currentExamPath));
            }}
          />
        ))}
        {canEdit && <CardListEntry question={''} answer={''} id={'+'} onclick={() => {
          createCardClick()
        }}/>}
        {canEdit &&
          <div key={1000} className={styles.uploadItem} onClick={() => {
            navigate(buildFileUploadPath(exam?.id, currentExamPath))
          }}>
            <div className={styles.uploadIcon}>
              <img src='upload button.svg' alt='' width={16}/>
            </div>
            <div className={styles.uploadListItem}>
              <p className={styles.uploadTitle}>Загрузить из файла</p>
            </div>
          </div>
        }
        {canEdit &&
          <div
            key={1001}
            className={`${styles.uploadItem} ${isScanDisabled ? styles.uploadItemDisabled : ''}`}
            onClick={handleFolderPickClick}
          >
            <div className={styles.uploadIcon}>
              <img src='scan.svg' alt='' width={24}/>
            </div>
            <div className={styles.uploadListItem}>
              <p className={styles.uploadTitle}>
                {isOcrRunning ? 'Обрабатываю папку...' : 'Загрузить папку фото'}
              </p>
            </div>
          </div>
        }
        {isOcrRunning && (
          <button
            type="button"
            className={styles.cancelScanButton}
            onClick={handleCancelScanClick}
          >
            Отменить сканирование
          </button>
        )}
        {ocrStatusText && <div className={styles.ocrStatus}>{ocrStatusText}</div>}
        <input
          ref={folderInputRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(event) => void handleFolderSelected(event)}
        />
      </div>

      <AccessToogle currentAccess={exam?.scope} handler={changeScope} isOpened={isRightScreenOpened} onClose={() => setRightScreenOpened(false)}/>
      <EditorsMenu examId={searchParams.get('examId')}
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
