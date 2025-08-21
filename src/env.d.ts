/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly BASE_URL?: string;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
