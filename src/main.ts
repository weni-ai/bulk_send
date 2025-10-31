import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as Sentry from '@sentry/vue';

import './styles/global.scss';
import '@weni/unnnic-system/dist/style.css';

import i18n from './utils/plugins/i18n';

import App from './App.vue';
import router from './router';
import env from './utils/env';
import { moduleStorage } from './utils/storage';

import { safeImport, isFederatedModule } from './utils/moduleFederation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharedStore: any = null;

if (isFederatedModule) {
  const { useSharedStore } = await safeImport(
    () => import('connect/sharedStore'),
    'connect/sharedStore',
  );

  sharedStore = useSharedStore?.();
}

interface MountBulkSendAppOptions {
  containerId?: string;
  initialRoute?: string;
}

export default async function mountBulkSendApp({
  containerId = 'app',
  initialRoute,
}: MountBulkSendAppOptions = {}) {
  let appRef = null;

  const pinia = createPinia();
  const app = createApp(App);

  pinia.use(Sentry.createSentryPiniaPlugin());

  app.use(pinia);
  app.use(router);
  app.use(i18n);

  if (isFederatedModule && initialRoute) await router.replace(initialRoute);

  if (env('SENTRY_DSN')) {
    Sentry.init({
      app,
      dsn: env('SENTRY_DSN'),
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: env('ENVIRONMENT'),
    });
  }

  if (sharedStore) {
    console.log(
      '[BulkSend - main.ts] Mounting app federated',
      sharedStore.current.project.uuid,
    );
    moduleStorage.setItem('authToken', sharedStore.auth.token);
    moduleStorage.setItem('projectUuid', sharedStore.current.project.uuid);
  }

  app.mount(`#${containerId}`);
  appRef = app;

  return { app: appRef, router };
}

if (!sharedStore) {
  console.log('[BulkSend - main.ts] Mounting app not federated');
  mountBulkSendApp();
}
