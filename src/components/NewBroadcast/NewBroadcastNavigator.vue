<template>
  <UnnnicNavigator
    :class="{
      'new-broadcast-navigator': true,
      'new-broadcast-navigator--disabled-variables-page': disabledVariablesPage,
    }"
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

const disabledVariablesPage = computed(() => {
  return (
    broadcastsStore.newBroadcast.currentPage ===
      NewBroadcastPage.CONFIRM_AND_SEND &&
    !broadcastsStore.newBroadcast.selectedTemplate?.variableCount
  );
});

const currentPage = computed(() => {
  return getPageLabel(broadcastsStore.newBroadcast.currentPage);
});

const pages = computed(() =>
  Object.values(NewBroadcastPage).map((page) => getPageLabel(page)),
);

const getPageLabel = (page: NewBroadcastPage) => {
  if (
    disabledVariablesPage.value &&
    page === NewBroadcastPage.SELECT_VARIABLES
  ) {
    return t('new_broadcast.pages.select_variables_disabled.title');
  }

  return t(`new_broadcast.pages.${page}.title`);
};
</script>

<style scoped lang="scss">
.new-broadcast-navigator {
  :deep(.unnnic-navigator-pages__page) {
    max-width: unset;
  }

  &--disabled-variables-page {
    :nth-child(3) {
      :deep(.unnnic-navigator-pages__page-progress) {
        background-color: $unnnic-color-neutral-clean;
      }
    }
  }
}
</style>
