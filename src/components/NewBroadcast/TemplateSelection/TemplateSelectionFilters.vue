<template>
  <section class="template-selection-filters">
    <UnnnicInput
      class="template-selection-filters__search"
      :modelValue="search"
      iconLeft="search"
      size="sm"
      :placeholder="
        $t('new_broadcast.pages.select_template.filters.search_placeholder')
      "
      :iconRight="searchClearIcon"
      iconRightClickable
      data-test="search"
      @icon-right-click="handleSearchClear"
      @update:model-value="handleSearchUpdate"
    />

    <UnnnicButton
      class="template-selection-filters__new-template"
      size="small"
      type="secondary"
      iconLeft="add-1"
      :text="$t('new_broadcast.pages.select_template.filters.new_tamplate')"
      data-test="new-template"
      @click="handleNewTemplate"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { unnnicCallAlert } from '@weni/unnnic-system';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const broadcastsStore = useBroadcastsStore();

const props = defineProps<{
  search: string;
}>();

const emit = defineEmits(['update:search']);

const searchClearIcon = computed(() => {
  return props.search !== '' ? 'close' : undefined;
});

const handleSearchUpdate = useDebounceFn((value: string) => {
  emit('update:search', value);
}, 400);

const handleSearchClear = () => {
  emit('update:search', '');
};

const handleNewTemplate = () => {
  const channelAppUuid = broadcastsStore.newBroadcast.channel?.appUuid;
  if (!channelAppUuid) {
    unnnicCallAlert({
      props: {
        text: t(
          'new_broadcast.pages.select_template.filters.channel_not_found',
        ),
        type: 'error',
      },
      seconds: 10,
    });
    return;
  }
  window.parent.postMessage(
    {
      event: 'redirect',
      path: `integrations:apps/my/wpp-cloud/${channelAppUuid}/templates`,
    },
    '*',
  );
};
</script>

<style scoped lang="scss">
.template-selection-filters {
  display: flex;
  gap: $unnnic-spacing-xs;

  &__search {
    flex: 4;
  }

  &__language {
    flex: 1;
  }

  &__new-template {
    flex: 1;
  }
}
</style>
