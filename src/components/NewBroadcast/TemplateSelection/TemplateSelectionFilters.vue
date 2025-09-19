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

    <UnnnicSelectSmart
      v-if="hasMultipleChannels"
      class="template-selection-filters__channel"
      :modelValue="channelOption"
      :options="channelsOptions"
      :isLoading="loadingChannels"
      size="sm"
      @update:model-value="handleChannelUpdate"
    />

    <!-- <UnnnicButton
      class="template-selection-filters__new-template"
      size="small"
      type="secondary"
      iconLeft="add-1"
      :text="$t('new_broadcast.pages.select_template.filters.new_tamplate')"
      data-test="new-template"
      @click="handleNewTemplate"
    /> -->
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useProjectStore } from '@/stores/project';
import type { SelectOption } from '@/types/select';
import type { Channel } from '@/types/channel';

const projectStore = useProjectStore();

type ChannelOption = SelectOption<string>;
const ALL_CHANNELS_VALUE = 'ALL';

const props = defineProps<{
  search: string;
  channel?: Channel;
}>();

const emit = defineEmits(['update:search', 'update:channel']);

const channels = computed(() => {
  return projectStore.project.channels.filter(
    (channel) => channel.channel_type === 'WAC',
  );
});

const searchClearIcon = computed(() => {
  return props.search !== '' ? 'close' : undefined;
});

const hasMultipleChannels = computed(() => {
  return channels.value.length > 1;
});

const loadingChannels = computed(() => {
  return projectStore.loadingChannels;
});

const channelsOptions = computed(() => {
  const channelsOptionsList = channels.value.map((channel) => ({
    label: channel.name,
    value: channel.uuid,
  }));

  const options = [
    {
      label: 'All channels',
      value: ALL_CHANNELS_VALUE,
    },
    ...channelsOptionsList,
  ];

  return options;
});

const channelOption = computed(() => {
  if (!props.channel) {
    return [
      {
        label: 'All channels',
        value: ALL_CHANNELS_VALUE,
      },
    ];
  }

  const option = channelsOptions.value.find(
    (option) => option.value === props.channel?.uuid,
  );

  if (!option) {
    return [];
  }

  return [option];
});

const handleSearchUpdate = useDebounceFn((value: string) => {
  emit('update:search', value);
}, 400);

const handleSearchClear = () => {
  emit('update:search', '');
};

const handleChannelUpdate = (selectedChannel: ChannelOption[]) => {
  if (!selectedChannel[0] || selectedChannel[0].value === ALL_CHANNELS_VALUE) {
    emit('update:channel', undefined);
    return;
  }

  const channel = channels.value.find(
    (channel) => channel.uuid === selectedChannel[0].value,
  );
  emit('update:channel', channel);
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
