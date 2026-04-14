type FolderAwareFile = File & {
  webkitRelativePath?: string;
};

export type OcrUploadFile = {
  file: File;
  relativePath?: string;
};

type LocalOcrUploadResponse = {
  batchId: string;
  fileCount: number;
  imageNames: string[];
};

const LOCAL_OCR_UPLOAD_URL = '/local/ocr/upload-folder';

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.bmp',
  '.gif',
  '.tif',
  '.tiff',
]);

function isImageFile(file: FolderAwareFile): boolean {
  if (file.type.startsWith('image/')) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return Array.from(IMAGE_EXTENSIONS).some((extension) => lowerName.endsWith(extension));
}

function getUploadedFileName(file: FolderAwareFile, index: number): string {
  const relativePath = file.webkitRelativePath?.trim();
  if (relativePath) {
    return relativePath;
  }

  return file.name || `image-${index + 1}.jpg`;
}

function isOcrUploadFile(value: unknown): value is OcrUploadFile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'file' in value;
}

function normalizeFolderFiles(files: FileList | File[] | OcrUploadFile[]): OcrUploadFile[] {
  const inputFiles = Array.from(files as ArrayLike<File | OcrUploadFile>);

  return inputFiles.map((item) => {
    if (isOcrUploadFile(item)) {
      return item;
    }

    return {
      file: item,
      relativePath: getUploadedFileName(item as FolderAwareFile, 0)
    };
  });
}

export function supportsDirectoryPicker(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) {
    return;
  }

  throw new DOMException('The operation was aborted.', 'AbortError');
}

export async function probeLocalOcrBridge(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(LOCAL_OCR_UPLOAD_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (response.headers.get('x-local-ocr-bridge') !== '1' || !response.ok) {
      return false;
    }

    const payload = await response.json().catch(() => null) as {available?: unknown} | null;
    return payload?.available === true;
  } catch {
    throwIfAborted(signal);
    return false;
  }
}

export async function collectOcrFilesFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  signal?: AbortSignal
): Promise<OcrUploadFile[]> {
  const files: OcrUploadFile[] = [];

  const walk = async (handle: FileSystemDirectoryHandle, prefix = ''): Promise<void> => {
    for await (const [name, entry] of handle.entries()) {
      throwIfAborted(signal);
      const relativePath = prefix ? `${prefix}/${name}` : name;

      if (entry.kind === 'directory') {
        await walk(entry as FileSystemDirectoryHandle, relativePath);
        continue;
      }

      throwIfAborted(signal);
      const file = await (entry as FileSystemFileHandle).getFile();
      files.push({file, relativePath});
    }
  };

  await walk(directoryHandle);
  return files;
}

export async function uploadOcrFolder(
  files: FileList | File[] | OcrUploadFile[],
  signal?: AbortSignal
): Promise<LocalOcrUploadResponse> {
  const folderFiles = normalizeFolderFiles(files);
  const imageFiles = folderFiles.filter((item) => isImageFile(item.file as FolderAwareFile));

  if (imageFiles.length === 0) {
    throw new Error('В выбранной папке не найдено изображений');
  }

  const formData = new FormData();
  imageFiles.forEach((item, index) => {
    formData.append('files', item.file, item.relativePath?.trim() || getUploadedFileName(item.file as FolderAwareFile, index));
  });

  let response: Response;
  try {
    response = await fetch(LOCAL_OCR_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      signal,
    });
  } catch {
    throwIfAborted(signal);
    throw new Error('OCR bridge недоступен. Проверьте маршрут загрузки папки.');
  }

  const payload = await response.json().catch(() => null) as Partial<LocalOcrUploadResponse> & {
    message?: string;
  } | null;

  if (!response.ok) {
    const unavailableMessage = response.status === 404
      ? 'Загрузка папки с изображениями недоступна в этой сборке приложения.'
      : null;

    throw new Error(payload?.message ?? unavailableMessage ?? 'Не удалось загрузить папку с изображениями');
  }

  if (!Array.isArray(payload?.imageNames)) {
    throw new Error('Локальный OCR bridge вернул неожиданный ответ');
  }

  return {
    batchId: String(payload.batchId ?? ''),
    fileCount: Number(payload.fileCount ?? payload.imageNames.length),
    imageNames: payload.imageNames.map(String),
  };
}
