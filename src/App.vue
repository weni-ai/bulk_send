<template>
  <div
    id="app"
    :class="`app-bulk_send app-bulk_send--${!sharedStore ? 'dev' : 'prod'}`"
  >
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { safeImport, isFederatedModule } from '@/utils/moduleFederation';
import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';

const authStore = useAuthStore();
const projectStore = useProjectStore();

const sharedStore = ref(null);

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
  authStore.setToken(localStorage.getItem('authToken') || '');
  projectStore.setProjectUuid(localStorage.getItem('projectUuid') || '');
};
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
