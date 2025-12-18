/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VAPID_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
