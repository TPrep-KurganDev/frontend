import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

import {createLocalOcrFolderUploadPlugin} from './config/localOcrFolderUploadPlugin';

const OCR_IMAGES_DIRECTORY = 'C:/Users/yurar/PycharmProjects/backend/images';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      createLocalOcrFolderUploadPlugin(OCR_IMAGES_DIRECTORY),
    ],
    server: {
      allowedHosts: ['localhost', '127.0.0.1', '8247a95998672a.lhr.life'],
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        }
      }
    }
  };
});
