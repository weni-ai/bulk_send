<template>
  <UnnnicModalDialog
    class="channel-selection-modal"
    :modelValue="modelValue"
    :title="$t('modals.channel_selection.title')"
    :primaryButtonProps="{
      text: $t('modals.channel_selection.buttons.primary'),
      disabled: !selectedChannel,
    }"
    :secondaryButtonProps="{
      text: $t('modals.channel_selection.buttons.secondary'),
    }"
    size="md"
    showActionsDivider
    showCloseIcon
    @update:model-value="handleUpdateModelValue"
    @primary-button-click="handlePrimaryButtonClick"
    @secondary-button-click="handleSecondaryButtonClick"
  >
    <section class="channel-selection-modal__content">
      <p class="channel-selection-modal__description">
        {{ $t('modals.channel_selection.description') }}
      </p>
      <UnnnicSelect
        returnObject
        class="channel-selection-modal__select"
        :options="channelsOptions"
        :modelValue="channelOption"
        :disabled="loadingChannels"
        @update:model-value="handleChannelUpdate"
      />
    </section>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { SelectOption } from '@/types/select';
import { useProjectStore } from '@/stores/project';
import { useBroadcastsStore } from '@/stores/broadcasts';

const projectStore = useProjectStore();
const broadcastsStore = useBroadcastsStore();

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'update:channel']);

const loadingChannels = computed(() => {
  return projectStore.loadingChannels;
});

const selectedChannel = computed(() => {
  return broadcastsStore.newBroadcast.channel;
});

const channelOption = computed<SelectOption | undefined>(() => {
  if (!selectedChannel.value) {
    return undefined;
  }

  return {
    label: selectedChannel.value.name,
    value: selectedChannel.value.uuid,
  };
});

const channelsOptions = computed<SelectOption[]>(() => {
  return projectStore.wppChannels.map((channel) => ({
    label: channel.name,
    value: channel.uuid,
  }));
});

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

const handlePrimaryButtonClick = () => {
  if (!selectedChannel.value) {
    return;
  }

  emit('update:channel', selectedChannel.value);
};

const handleSecondaryButtonClick = () => {
  handleUpdateModelValue(false);
};

const handleChannelUpdate = (option: SelectOption) => {
  const channelMatch = projectStore.wppChannels.find(
    (channel) => channel.uuid === option.value,
  );
  if (!channelMatch) {
    return;
  }

  broadcastsStore.setChannel(channelMatch);
};

watch(
  [channelsOptions, loadingChannels],
  ([options, loading]) => {
    if (!selectedChannel.value && !loading && options.length > 0) {
      handleChannelUpdate(options[0]);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.channel-selection-modal {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;
  }
}
</style>

<style lang="scss">
.channel-selection-modal {
  .unnnic-modal-dialog__container__content,
  .unnnic-modal-dialog__container__body,
  .unnnic-modal-dialog__container {
    overflow: visible;
  }
}
</style>
