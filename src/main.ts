import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as Sentry from '@sentry/vue';

import './styles/global.scss';
import '@weni/unnnic-system/dist/style.css';

import Unnnic from './utils/plugins/UnnnicSystem';
import i18n from './utils/plugins/i18n';

import App from './App.vue';
import router from './router';
import env from './utils/env';

import { safeImport, isFederatedModule } from './utils/moduleFederation';

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
  app.use(Unnnic);

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

  app.mount(`#${containerId}`);
  appRef = app;

  return { app: appRef, router };
}

// Handle sharedStore asynchronously without blocking app mount
safeImport(() => import('connect/sharedStore'), 'connect/sharedStore')
  .then((module) => {
    console.log('Shared store imported');
    if (module.useSharedStore && isFederatedModule) {
      console.log('Using shared store');
      const sharedStore = module.useSharedStore();
      if (sharedStore) {
        console.log('Setting auth token and project uuid', sharedStore);
        localStorage.setItem('authToken', sharedStore.auth.token);
        localStorage.setItem('projectUuid', sharedStore.current.project.uuid);
      }
    }
  })
  .catch((e) => {
    console.log('Error importing shared store', e);
    // Ignore errors - app should work without sharedStore
  });

// Always mount the app if it's not a federated module
if (!isFederatedModule) {
  mountBulkSendApp();
}
