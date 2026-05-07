import {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {toast} from 'react-hot-toast';

import styles from './ExamCreateScreen.module.scss';
import Header from '../../components/Header/Header';
import {AccessToogle} from '../../components/AccessToogle/AccessToogle';
import {AppRoute} from '../../const';
import {createExam, ExamOut, getExam, updateExam} from '../../api/exam';
import {createCardsFromOcr} from '../../api/cards';
import {
  collectOcrFilesFromDirectory,
  probeLocalOcrBridge,
  supportsDirectoryPicker,
  uploadOcrFolder,
  type OcrUploadFile
} from '../../api/localOcr';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';
import {pluralizeRu} from '../../utils/pluralizeRu';
import {extractApiErrorMessage} from '../../utils/extractApiErrorMessage';
import {buildExamCoverPath, buildExamPath, buildFileUploadPath} from '../../utils/backNavigation';

const EMPTY_FOLDER_ERROR = 'В выбранной папке нет файлов. Выберите папку, где лежат изображения для OCR.';
const FOLDER_OCR_UNAVAILABLE_ERROR = 'Загрузка папки с изображениями недоступна в текущей сборке приложения.';
const READ_FOLDER_STATUS = 'Читаю файлы из папки...';
const UPLOAD_FOLDER_STATUS = 'Загружаю папку с изображениями...';
const STOPPING_STATUS = 'Сканирование останавливается...';
const STOPPED_STATUS = 'Сканирование остановлено';
const CREATE_EXAM_ERROR = 'Не удалось создать тест';
const DEFAULT_TITLE = 'Новый экзамен';
const DEFAULT_SCOPE = 'default';

type FolderFiles = FileList | File[] | OcrUploadFile[];

function getScopeLabel(scope: string | undefined): string {
  switch (scope) {
    case 'personal':
      return 'Только для меня';
    case 'link':
      return 'По ссылке';
    case 'default':
    default:
      return 'Публичный доступ';
  }
}

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

export function ExamCreateScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchExamId = searchParams.get('examId') ?? '';
  const [examId, setExamId] = useState(searchExamId);
  const [exam, setExam] = useState<ExamOut | null>(null);
  const isOnline = useNetworkStatus();
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const scanAbortControllerRef = useRef<AbortController | null>(null);
  const createExamRequestRef = useRef<Promise<string | null> | null>(null);

  const [ocrStatusText, setOcrStatusText] = useState('');
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [isFolderOcrAvailable, setIsFolderOcrAvailable] = useState(false);
  const [isExamCreating, setIsExamCreating] = useState(false);
  const [examTitle, setExamTitle] = useState(DEFAULT_TITLE);
  const [selectedScope, setSelectedScope] = useState(DEFAULT_SCOPE);
  const [isRightScreenOpened, setRightScreenOpened] = useState(false);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const [isScopeSaving, setIsScopeSaving] = useState(false);

  useEffect(() => {
    setExamId(searchExamId);

    if (!searchExamId) {
      setExam(null);
      setExamTitle(DEFAULT_TITLE);
      setSelectedScope(DEFAULT_SCOPE);
      return;
    }

    let cancelled = false;

    getExam(searchExamId)
      .then((nextExam) => {
        if (cancelled) {
          return;
        }

        setExam(nextExam);
        setExamTitle(nextExam.title);
        setSelectedScope(nextExam.scope);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        navigate(AppRoute.NotFound);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, searchExamId]);

  const getNormalizedExamTitle = () => {
    return examTitle.trim() || DEFAULT_TITLE;
  };

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

  const ensureExamId = async (): Promise<string | null> => {
    if (examId) {
      if (exam?.id === examId) {
        return examId;
      }

      try {
        const nextExam = await getExam(examId);
        setExam(nextExam);
        setExamTitle(nextExam.title);
        setSelectedScope(nextExam.scope);
        return nextExam.id;
      } catch {
        navigate(AppRoute.NotFound);
        return null;
      }
    }

    if (createExamRequestRef.current) {
      return createExamRequestRef.current;
    }

    const request = (async () => {
      setIsExamCreating(true);

      try {
        const nextExam = await createExam(getNormalizedExamTitle(), selectedScope);
        setExamId(nextExam.id);
        setExam(nextExam);
        setExamTitle(nextExam.title);
        setSelectedScope(nextExam.scope);
        navigate(`${AppRoute.ExamCreate}?examId=${nextExam.id}`, {replace: true});

        return nextExam.id;
      } catch (error) {
        toast.error(extractApiErrorMessage(error, CREATE_EXAM_ERROR));
        return null;
      } finally {
        setIsExamCreating(false);
        createExamRequestRef.current = null;
      }
    })();

    createExamRequestRef.current = request;
    return request;
  };

  const finishOcrRun = (controller?: AbortController | null, nextStatusText = '') => {
    if (!controller || scanAbortControllerRef.current === controller) {
      scanAbortControllerRef.current = null;
    }

    setIsOcrRunning(false);
    setOcrStatusText(nextStatusText);
  };

  const handleFileUploadClick = async () => {
    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }

    const nextExamId = await ensureExamId();
    if (!nextExamId) {
      return;
    }

    const isTitleSaved = await saveExamTitleIfNeeded();
    if (!isTitleSaved) {
      return;
    }

    navigate(buildFileUploadPath(nextExamId, buildExamPath(nextExamId)));
  };

  const handleFolderPickClick = () => {
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

    const nextExamId = await ensureExamId();
    if (!nextExamId) {
      finishOcrRun(controller);
      return;
    }

    const isTitleSaved = await saveExamTitleIfNeeded();
    if (!isTitleSaved) {
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
          const cards = await createCardsFromOcr(nextExamId, imageName, controller.signal);
          createdCards += cards.length;
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

      toast.success(getOcrSuccessMessage(createdCards, failedImages));
      finishOcrRun(controller);
      navigate(buildExamPath(nextExamId));
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

  const isCurrentExamLoaded = !examId || exam?.id === examId;
  const isExistingExamLoading = Boolean(examId && !isCurrentExamLoaded);

  const saveExamTitleIfNeeded = async (): Promise<boolean> => {
    if (!isCurrentExamLoaded) {
      return false;
    }

    const nextTitle = getNormalizedExamTitle();
    if (nextTitle !== examTitle) {
      setExamTitle(nextTitle);
    }

    if (!exam || nextTitle === exam.title) {
      return true;
    }

    if (!isOnline) {
      notifyOnlineOnly();
      return false;
    }

    setIsTitleSaving(true);

    try {
      const nextExam = await updateExam(exam.id, {title: nextTitle, scope: exam.scope});
      setExam(nextExam);
      setExamTitle(nextExam.title);
      setSelectedScope(nextExam.scope);
      return true;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Не удалось изменить название теста'));
      return false;
    } finally {
      setIsTitleSaving(false);
    }
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const handleScopeChange = async (scope: string) => {
    if (!isCurrentExamLoaded) {
      setRightScreenOpened(false);
      return;
    }

    if (exam && !isOnline) {
      notifyOnlineOnly();
      setRightScreenOpened(false);
      return;
    }

    const previousScope = selectedScope;
    setSelectedScope(scope);
    setRightScreenOpened(false);

    if (!exam) {
      return;
    }

    setIsScopeSaving(true);

    try {
      const nextExam = await updateExam(exam.id, {title: getNormalizedExamTitle(), scope});
      setExam(nextExam);
      setExamTitle(nextExam.title);
      setSelectedScope(nextExam.scope);
    } catch (error) {
      setSelectedScope(previousScope);
      toast.error(extractApiErrorMessage(error, 'Не удалось изменить права доступа'));
    } finally {
      setIsScopeSaving(false);
    }
  };

  const handleCreateEmptyExamClick = async () => {
    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }

    const nextExamId = await ensureExamId();
    if (!nextExamId) {
      return;
    }

    const isTitleSaved = await saveExamTitleIfNeeded();
    if (!isTitleSaved) {
      return;
    }

    navigate(buildExamPath(nextExamId));
  };

  const isActionDisabled =
    isOcrRunning || isExamCreating || isTitleSaving || isScopeSaving || isExistingExamLoading || !isOnline;
  const backButtonPage = examId ? buildExamCoverPath(examId) : AppRoute.Main;

  return (
    <>
      <Header
        title={''}
        inputDisabled={true}
        inputRef={undefined}
        onInputBlur={() => {}}
        onTitleChange={() => {}}
        backButtonPage={backButtonPage}
      />
      <div className={styles.content}>
        <div className={styles.nameText}>Название</div>
        <input
          type="text"
          aria-label="Название"
          className={styles.name}
          value={examTitle}
          onChange={(event) => setExamTitle(event.target.value)}
          onBlur={() => {
            void saveExamTitleIfNeeded();
          }}
          onKeyDown={handleTitleKeyDown}
          disabled={isActionDisabled}
        />
        <div className={styles.rightsText}>Права доступа</div>
        <button
          type="button"
          className={styles.rights}
          onClick={() => setRightScreenOpened(true)}
          disabled={isActionDisabled}
        >
          {getScopeLabel(selectedScope)}
        </button>
        <button
          type="button"
          className={styles.loadButton}
          onClick={() => { void handleFileUploadClick(); }}
          disabled={isActionDisabled}
        >
          <span className={styles.loadText}>Загрузить из файла</span>
          <img className={styles.loadIcon} src="load.svg" alt=""/>
        </button>
        <button
          type="button"
          className={styles.scanButton}
          onClick={handleFolderPickClick}
          disabled={isActionDisabled}
        >
          <span className={styles.scanText}>
            {isOcrRunning ? 'Обрабатываю папку...' : 'Загрузить папку фото'}
          </span>
          <img className={styles.scanIcon} src="scan.svg" alt=""/>
        </button>
        <button
          type="button"
          className={styles.createButton}
          onClick={() => { void handleCreateEmptyExamClick(); }}
          disabled={isActionDisabled}
        >
          <span className={styles.createText}>
            {isExamCreating ? 'Создаю тест...' : 'Создать тест'}
          </span>
          <img className={styles.createIcon} src="createTest.svg" alt=""/>
        </button>

        {isExamCreating && <div className={styles.loadingNote}>Подготавливаю новый тест...</div>}
        {isOcrRunning && <div className={styles.loadingNote}>Карточки загружаются...</div>}
        {isOcrRunning && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancelScanClick}
          >
            Отменить сканирование
          </button>
        )}
        {ocrStatusText && <div className={styles.status}>{ocrStatusText}</div>}

        <input
          ref={folderInputRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(event) => void handleFolderSelected(event)}
        />
      </div>
      <AccessToogle
        currentAccess={selectedScope}
        handler={(scope) => {
          void handleScopeChange(scope);
        }}
        isOpened={isRightScreenOpened}
        onClose={() => setRightScreenOpened(false)}
      />
    </>
  );
}
