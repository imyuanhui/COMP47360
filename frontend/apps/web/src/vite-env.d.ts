/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_KEY: string;
  readonly VITE_API_URL: string;
  // add more VITE_ vars here if you have them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
