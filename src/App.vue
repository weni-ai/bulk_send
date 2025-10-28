<template>
  <div
    id="app"
    :class="`app-bulk_send app-bulk_send--${!sharedStore ? 'dev' : 'prod'}`"
  >
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, computed } from 'vue';
import { safeImport, isFederatedModule } from '@/utils/moduleFederation';
import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import { moduleStorage } from '@/utils/storage';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import initHotjar from '@/utils/plugins/hotjar.js';

const authStore = useAuthStore();
const projectStore = useProjectStore();
const { locale } = useI18n();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sharedStore: any = ref(null);

onBeforeMount(async () => {
  updateTokenAndProject();

  // Non-blocking import
  safeImport(() => import('connect/sharedStore'), 'connect/sharedStore')
    .then(({ useSharedStore }) => {
      if (useSharedStore && isFederatedModule) {
        try {
          sharedStore.value = useSharedStore();
        } catch (error) {
          console.error(
            '[BulkSend - App.vue] Error initializing shared store:',
            error,
          );
        }
      } else {
        console.log('[BulkSend - App.vue] Not federated module');
      }
    })
    .catch((error) => {
      console.error(
        '[BulkSend - App.vue] Error loading shared store module:',
        error,
      );
    });
});

const updateTokenAndProject = () => {
  authStore.setToken(moduleStorage.getItem('authToken') || '');
  projectStore.setProjectUuid(moduleStorage.getItem('projectUuid') || '');
};

const language = computed(() => sharedStore.value?.user.language || 'en');
const userEmail = computed(() => sharedStore.value?.user.email || undefined);

watch(
  language,
  (newLanguage: string) => {
    if (!newLanguage) return;

    console.log('[DEBUG] sharedStore', sharedStore.value);

    locale.value = newLanguage;
    moment.locale(newLanguage);
  },
  { immediate: true },
);

watch(userEmail, (newUserEmail: string) => {
  console.log('newUserEmail', newUserEmail);
  if (newUserEmail) {
    console.log('initHotjar');
    initHotjar(newUserEmail);
  }
});
</script>

<style lang="scss" scoped>
.app-bulk_send {
  display: flex;
  flex-direction: column;

  &--prod {
    height: 100%;
    width: 100%;
    flex: 1;
  }

  &--dev {
    height: 100vh;
    min-height: 100vh;
  }
}
</style>
