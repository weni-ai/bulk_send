<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { safeImport, isFederatedModule } from '@/utils/moduleFederation'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'

// Remove top-level await and make it reactive
const sharedStore = ref(null)

onMounted(async () => {
  updateTokenAndProject()

  // Non-blocking import
  safeImport(() => import('connect/sharedStore'), 'connect/sharedStore')
    .then(({ useSharedStore }) => {
      if (useSharedStore && isFederatedModule) {
        try {
          sharedStore.value = useSharedStore()
        } catch (error) {
          console.error('Error initializing shared store:', error)
        }
      } else {
        console.log('Not federated module')
      }
    })
    .catch((error) => {
      console.error('Error loading shared store module:', error)
    })
})

const updateTokenAndProject = () => {
  const authStore = useAuthStore()
  const projectStore = useProjectStore()

  authStore.setToken(localStorage.getItem('authToken') || '')
  projectStore.setProjectUuid(localStorage.getItem('projectUuid') || '')
}
</script>

<template>
  <div id="app" :class="`app-bulk_send-${!sharedStore ? 'dev' : 'prod'}`">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.app-bulk_send-prod {
  height: 100%;
  width: 100%;
}

.app-bulk_send-dev {
  height: 100vh;
  width: 100vw;
}
</style>
