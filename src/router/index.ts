import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { isFederatedModule } from '@/utils/moduleFederation'

const history = isFederatedModule
  ? createMemoryHistory() // To isolate routing from parent app
  : createWebHistory('/')

const routes = [
  {
    path: '/',
    name: 'HomeBulkSend',
    component: () => import('@/views/BulkSend/HomeBulkSend.vue'),
  },
]

const router = createRouter({
  history,
  routes,
})

router.afterEach((router) => {
  delete router.query.next
  delete router.query.projectUuid

  if (isFederatedModule) {
    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: { path: router.path, query: router.query },
      }),
    )
  } else {
    window.parent.postMessage(
      {
        event: 'changePathname',
        pathname: window.location.pathname,
        query: router.query,
      },
      '*',
    )
  }
})

export default router
