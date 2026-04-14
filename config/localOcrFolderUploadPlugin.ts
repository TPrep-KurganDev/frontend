import {createWriteStream} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';

import Busboy from 'busboy';
import type {Plugin} from 'vite';

const LOCAL_OCR_UPLOAD_PATH = '/local/ocr/upload-folder';
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

type MiddlewareHandler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void | Promise<void>;
type MiddlewareServer = {
  middlewares: {
    use: (handler: MiddlewareHandler) => void;
  };
};

function sanitizePathSegment(segment: string): string {
  const withoutControlCharacters = Array.from(segment)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f;
    })
    .join('');

  const cleaned = withoutControlCharacters
    .normalize('NFC')
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^[. ]+|[. ]+$/g, '');

  return cleaned || 'file';
}

function sanitizeRelativePath(relativePath: string): string {
  return relativePath
    .split(/[\\/]+/)
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '..')
    .map(sanitizePathSegment)
    .join('/');
}

function getRequestPathname(req: IncomingMessage): string {
  return new URL(req.url ?? '/', 'http://localhost').pathname;
}

function createJsonResponse(res: ServerResponse, statusCode: number, payload: Record<string, unknown>): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Local-Ocr-Bridge', '1');
  res.end(JSON.stringify(payload));
}

function registerLocalOcrFolderUploadRoute(server: MiddlewareServer, imagesDirectory: string): void {
  const resolvedImagesDirectory = path.resolve(imagesDirectory);

  server.middlewares.use(async (req, res, next) => {
    const pathname = getRequestPathname(req);
    if (pathname !== LOCAL_OCR_UPLOAD_PATH) {
      next();
      return;
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      createJsonResponse(res, 200, {available: true});
      return;
    }

    if (req.method !== 'POST') {
      createJsonResponse(res, 405, {message: 'Method Not Allowed'});
      return;
    }

    const batchId = `ocr-batch-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const batchDirectory = path.resolve(resolvedImagesDirectory, batchId);
    const imageNames: string[] = [];
    const writeTasks: Array<Promise<void>> = [];

    try {
      await mkdir(batchDirectory, {recursive: true});
    } catch (error) {
      createJsonResponse(res, 500, {
        message: error instanceof Error ? error.message : 'Не удалось подготовить OCR-хранилище',
      });
      return;
    }

    const busboy = Busboy({headers: req.headers});
    let hasInputError = false;

    busboy.on('file', (_fieldName, file, info) => {
      const safeRelativePath = sanitizeRelativePath(info.filename);
      const extension = path.extname(safeRelativePath).toLowerCase();

      if (!safeRelativePath || !IMAGE_EXTENSIONS.has(extension)) {
        file.resume();
        return;
      }

      const destinationPath = path.resolve(batchDirectory, safeRelativePath);
      if (!destinationPath.startsWith(batchDirectory + path.sep) && destinationPath !== batchDirectory) {
        hasInputError = true;
        file.resume();
        return;
      }

      imageNames.push(`${batchId}/${safeRelativePath.replace(/\\/g, '/')}`);

      const writeTask = mkdir(path.dirname(destinationPath), {recursive: true}).then(() => new Promise<void>((resolve, reject) => {
        const writeStream = createWriteStream(destinationPath);
        file.pipe(writeStream);
        file.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve());
      }));

      writeTasks.push(writeTask);
    });

    busboy.on('error', (error) => {
      hasInputError = true;
      createJsonResponse(res, 400, {
        message: error instanceof Error ? error.message : 'Не удалось прочитать папку',
      });
    });

    busboy.on('close', async () => {
      if (hasInputError) {
        return;
      }

      try {
        await Promise.all(writeTasks);
      } catch (error) {
        createJsonResponse(res, 500, {
          message: error instanceof Error ? error.message : 'Не удалось сохранить изображения',
        });
        return;
      }

      if (imageNames.length === 0) {
        createJsonResponse(res, 400, {
          message: 'В выбранной папке не найдено поддерживаемых изображений',
        });
        return;
      }

      createJsonResponse(res, 200, {
        batchId,
        fileCount: imageNames.length,
        imageNames,
      });
    });

    req.pipe(busboy);
  });
}

export function createLocalOcrFolderUploadPlugin(imagesDirectory: string): Plugin {
  return {
    name: 'local-ocr-folder-upload',
    configureServer(server) {
      registerLocalOcrFolderUploadRoute(server as unknown as MiddlewareServer, imagesDirectory);
    },
    configurePreviewServer(server) {
      registerLocalOcrFolderUploadRoute(server as unknown as MiddlewareServer, imagesDirectory);
    },
  };
}
