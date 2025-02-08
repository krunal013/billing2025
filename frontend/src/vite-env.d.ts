/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BASE_APP_BACKEND_BASEURL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  