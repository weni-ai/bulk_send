<template>
  <UnnnicButton
    :text="text"
    :type="type"
    :iconLeft="iconLeft"
    :loading="loading"
    @click="handleNewSend"
  />

  <ChannelSelectionModal
    v-if="showChannelSelectionModal"
    :modelValue="showChannelSelectionModal"
    @update:model-value="handleUpdateShowChannelSelectionModal"
    @update:channel="setChannelAndRedirect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useBroadcastsStore } from '@/stores/broadcasts';
import type { Channel } from '@/types/channel';
import ChannelSelectionModal from '@/components/modals/ChannelSelectionModal.vue';

defineProps<{
  text: string;
  type: 'primary' | 'secondary' | 'tertiary';
  iconLeft?: string;
  loading?: boolean;
}>();

const router = useRouter();
const projectStore = useProjectStore();
const broadcastsStore = useBroadcastsStore();

const showChannelSelectionModal = ref(false);

const handleNewSend = () => {
  if (projectStore.wppChannels.length > 1) {
    showChannelSelectionModal.value = true;
  } else {
    setChannelAndRedirect(projectStore.wppChannels[0]);
  }
};

const handleUpdateShowChannelSelectionModal = (value: boolean) => {
  showChannelSelectionModal.value = value;
};

const setChannelAndRedirect = (channel: Channel) => {
  broadcastsStore.setChannel(channel);
  router.push({ name: 'NewBroadcast', params: { channelUuid: channel.uuid } });
};
</script>
