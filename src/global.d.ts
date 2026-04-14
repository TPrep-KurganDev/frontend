/// <reference types="vite/client" />

declare module '*.module.scss' {
  const classes: { [key: string]: string };

  export default classes;
}

interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

interface Window {
  showDirectoryPicker?: (options?: {mode?: 'read' | 'readwrite'}) => Promise<FileSystemDirectoryHandle>;
}
