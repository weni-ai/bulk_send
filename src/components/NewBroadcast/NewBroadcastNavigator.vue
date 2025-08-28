<template>
  <UnnnicNavigator
    class="new-broadcast-navigator"
    :pages="pages"
    :activePage="currentPage"
  />
</template>

<script setup lang="ts">
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const broadcastsStore = useBroadcastsStore();

const getPageLabel = (page: NewBroadcastPage) => {
  return t(`new_broadcast.pages.${page}.title`);
};

const pages = Object.values(NewBroadcastPage).map((page) => getPageLabel(page));

const currentPage = computed(() => {
  return getPageLabel(broadcastsStore.newBroadcast.currentPage);
});
</script>

<style scoped lang="scss">
.new-broadcast-navigator {
  :deep(.unnnic-navigator-pages__page) {
    max-width: unset;
  }
}
</style>
