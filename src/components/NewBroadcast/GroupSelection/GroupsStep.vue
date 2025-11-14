<template>
  <section class="groups-step">
    <section
      v-if="!hasContactImport || !uploadFinished"
      class="groups-step__selection"
    >
      <GroupSelection
        class="groups-step__group-selection"
        :open="groupSelectionOpen"
        @update:open="handleGroupSelectionOpen"
      />
      <ContactImport
        :open="contactImportOpen"
        @update:open="handleContactImportOpen"
        @uploaded="handleUploaded"
      />
    </section>

    <ContactImportProcessing v-if="hasContactImport && uploadFinishedProp" />

    <StepActions
      :disabled="!canContinue"
      @cancel="handleCancel"
      @continue="handleContinue"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useContactImportStore } from '@/stores/contactImport';
import { useProjectStore } from '@/stores/project';
import { NewBroadcastPage } from '@/constants/broadcasts';
import GroupSelection from '@/components/NewBroadcast/GroupSelection/GroupSelection.vue';
import ContactImport from '@/components/NewBroadcast/ContactImport/ContactImport.vue';
import ContactImportProcessing from '@/components/NewBroadcast/ContactImport/ContactImportProcessing.vue';
import StepActions from '@/components/NewBroadcast/StepActions.vue';
import { useRouter } from 'vue-router';

const broadcastsStore = useBroadcastsStore();
const contactImportStore = useContactImportStore();
const projectStore = useProjectStore();
const router = useRouter();

const props = defineProps<{
  uploadFinished: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:upload-finished', value: boolean): void;
}>();

const uploadFinishedProp = computed(() => props.uploadFinished);

const groupSelectionOpen = computed(
  () => broadcastsStore.newBroadcast.groupSelectionOpen,
);
const contactImportOpen = computed(
  () => broadcastsStore.newBroadcast.contactImportOpen,
);

const hasContactImport = computed(() => contactImportStore.import);

const canConfirmImport = computed(() => {
  return (
    broadcastsStore.newBroadcast.currentPage ===
      NewBroadcastPage.SELECT_GROUPS && contactImportStore.import
  );
});

const canContinue = computed(() => {
  return (
    broadcastsStore.newBroadcast.selectedGroups.length > 0 ||
    (contactImportStore.import && uploadFinishedProp.value)
  );
});

const handleGroupSelectionOpen = (value: boolean) => {
  broadcastsStore.setGroupSelectionOpen(value);
  broadcastsStore.setContactImportOpen(!value);
};

const handleContactImportOpen = (value: boolean) => {
  broadcastsStore.setContactImportOpen(value);
  broadcastsStore.setGroupSelectionOpen(!value);
};

const handleUploaded = () => {
  emit('update:upload-finished', true);
};

const handleCancel = () => {
  if (contactImportStore.import) {
    contactImportStore.clearImport();
  }
  emit('update:upload-finished', false);
  broadcastsStore.resetNewBroadcast();
  router.push({ name: 'HomeBulkSend' });
};

const handleContinue = () => {
  if (canConfirmImport.value) {
    contactImportStore.confirmContactImport(
      projectStore.project.uuid,
      contactImportStore.import!.importId,
      contactImportStore.importProcessing,
    );

    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
    return;
  }

  if (broadcastsStore.newBroadcast.selectedGroups.length > 0) {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
  }
};
</script>

<style scoped lang="scss">
.groups-step {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  flex: 1;
  overflow: auto;

  &__group-selection::after {
    content: '';
    display: block;
    width: 100%;
    height: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }

  &__selection {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    overflow: auto;
  }
}
</style>
