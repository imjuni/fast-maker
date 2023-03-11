declare namespace NodeJS {
  interface ProcessEnv {
    SYNC_MODE?: string;
    FILE_LOG_MODE?: string;
    LOG_LEVEL?: string;
    USE_INIT_CWD?: string;
  }
}
