import {ChangeEvent, useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {toast} from 'react-hot-toast';

import styles from './ExamCreateScreen.module.scss';
import Header from '../../components/Header/Header';
import {AppRoute} from '../../const';
import {ExamOut, getExam} from '../../api/exam';
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

const EMPTY_FOLDER_ERROR = 'В выбранной папке нет файлов. Выберите папку, где лежат изображения для OCR.';
const FOLDER_OCR_UNAVAILABLE_ERROR = 'Загрузка папки с изображениями недоступна в текущей сборке приложения.';
const READ_FOLDER_STATUS = 'Читаю файлы из папки...';
const UPLOAD_FOLDER_STATUS = 'Загружаю папку с изображениями...';
const STOPPING_STATUS = 'Сканирование останавливается...';
const STOPPED_STATUS = 'Сканирование остановлено';

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
  const examId = searchParams.get('examId');
  const isOnline = useNetworkStatus();
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const scanAbortControllerRef = useRef<AbortController | null>(null);

  const [exam, setExam] = useState<ExamOut | null>(null);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [isFolderOcrAvailable, setIsFolderOcrAvailable] = useState(false);

  useEffect(() => {
    if (!examId) {
      navigate(AppRoute.NotFound);
      return;
    }

    let cancelled = false;

    getExam(examId)
      .then((nextExam) => {
        if (cancelled) {
          return;
        }

        setExam(nextExam);
      })
      .catch(() => {
        navigate(AppRoute.NotFound);
      });

    return () => {
      cancelled = true;
    };
  }, [examId, navigate]);

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

  const handleFileUploadClick = () => {
    if (!examId) {
      navigate(AppRoute.NotFound);
      return;
    }

    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }

    navigate(`${AppRoute.FileUpload}?examId=${examId}`);
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
    if (!examId) {
      finishOcrRun(controller);
      navigate(AppRoute.NotFound);
      return;
    }

    scanAbortControllerRef.current = controller;

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
          const cards = await createCardsFromOcr(examId, imageName, controller.signal);
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
      navigate(`${AppRoute.Exam}?examId=${examId}`);
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

  return (
    <>
      <Header
        title={''}
        inputDisabled={true}
        inputRef={undefined}
        onInputBlur={() => {}}
        onTitleChange={() => {}}
        backButtonPage={examId ? `${AppRoute.ExamCover}?examId=${examId}` : AppRoute.Main}
      />
      <div className={styles.content}>
        <div className={styles.nameText}>Название</div>
        <div className={styles.name}>{exam?.title ?? 'Загрузка...'}</div>
        <div className={styles.rightsText}>Права доступа</div>
        <div className={styles.rights}>{getScopeLabel(exam?.scope)}</div>
        <button
          type="button"
          className={styles.loadButton}
          onClick={handleFileUploadClick}
          disabled={isOcrRunning || !isOnline}
        >
          <span className={styles.loadText}>Загрузить из файла</span>
          <img className={styles.loadIcon} src="load.svg" alt=""/>
        </button>
        <button
          type="button"
          className={styles.scanButton}
          onClick={handleFolderPickClick}
          disabled={isOcrRunning || !isOnline}
        >
          <span className={styles.scanText}>
            {isOcrRunning ? 'Обрабатываю папку...' : 'Загрузить папку фото'}
          </span>
          <img className={styles.scanIcon} src="scan.svg" alt=""/>
        </button>

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
    </>
  );
}
