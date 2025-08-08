<template>
  <section class="recent-sends-list">
    <section class="recent-sends-list__content">
      <SendElement v-for="send in paginatedRecentSends" :key="send.id" :send="send" />
    </section>

    <UnnnicPagination class="recent-sends-list__pagination" :max="pageLimit" :model-value="page"
      @update:model-value="handlePageUpdate" />
  </section>
</template>

<script setup lang="ts">
import SendElement from '@/components/HomeBulkSend/SendElement.vue';
import type { RecentSend } from '@/types/recentSends';
import { PAGE_SIZE } from '@/constants/recentSends';
import { computed, ref } from 'vue';

const props = defineProps<{
  recentSends: RecentSend[]
}>()

const page = ref(1)
// TODO: page limit should be fetched from the API when the API is ready
const pageLimit = computed(() => {
  return Math.ceil(props.recentSends.length / PAGE_SIZE)
})

// TODO: handle page update should be implemented and fetch data from the new page when the API is ready
const handlePageUpdate = (newPage: number) => {
  page.value = newPage
}

// TODO: computed for now while we have mocked data, in the future will not be needed
const paginatedRecentSends = computed(() => {
  return props.recentSends.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
})
</script>

<style scoped lang="scss">
.recent-sends-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
  }

  &__pagination {
    margin-left: auto;
  }
}
</style>