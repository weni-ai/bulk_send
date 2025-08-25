<template>
  <div
    id="app"
    :class="`app-bulk_send app-bulk_send--${!sharedStore ? 'dev' : 'prod'}`"
  >
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { safeImport, isFederatedModule } from '@/utils/moduleFederation';
import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';

const authStore = useAuthStore();
const projectStore = useProjectStore();

const sharedStore = ref(null);

onMounted(async () => {
  updateTokenAndProject();

  // Non-blocking import
  safeImport(() => import('connect/sharedStore'), 'connect/sharedStore')
    .then(({ useSharedStore }) => {
      console.log('[BulkSend - App.vue] Shared store imported', useSharedStore);
      if (useSharedStore && isFederatedModule) {
        console.log('[BulkSend - App.vue] Using shared store');
        try {
          sharedStore.value = useSharedStore();
          console.log(
            '[BulkSend - App.vue] Shared store initialized',
            sharedStore.value,
          );
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
  console.log(
    '[BulkSend - App.vue] Updating token and project',
    localStorage.getItem('authToken'),
    localStorage.getItem('projectUuid'),
  );
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
    min-height: 100vh;
  }
}
</style>
