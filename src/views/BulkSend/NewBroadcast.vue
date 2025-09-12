<template>
  <NewBroadcastLayout>
    <template #header>
      <NewBroadcastHeader @back="handleBack" />
    </template>
    <template #content>
      <section class="new-broadcast-layout__content">
        <section
          v-if="isSelectGroupsPage"
          class="new-broadcast-layout__contacts"
        >
          <GroupsStep
            :uploadFinished="uploadFinished"
            @update:upload-finished="(v: boolean) => (uploadFinished = v)"
          />
        </section>
        <section
          v-if="isSelectTemplatePage"
          class="new-broadcast-layout__template"
        >
          <TemplateSelection data-test="template-selection" />
        </section>
        <section
          v-if="isSelectVariablesPage"
          class="new-broadcast-layout__variables"
        >
          <VariablesSelection data-test="variables-selection" />
        </section>
        <section
          v-if="isConfirmAndSendPage"
          class="new-broadcast-layout__confirm-and-send"
        >
          <ConfirmAndSend data-test="confirm-and-send" />
        </section>
      </section>
    </template>
  </NewBroadcastLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useContactImportStore } from '@/stores/contactImport';
import { useProjectStore } from '@/stores/project';
import { useTemplatesStore } from '@/stores/templates';
import { NewBroadcastPage } from '@/constants/broadcasts';
import NewBroadcastLayout from '@/layouts/BulkSend/NewBroadcastLayout.vue';
import NewBroadcastHeader from '@/components/NewBroadcast/NewBroadcastHeader.vue';
import GroupsStep from '@/components/NewBroadcast/GroupSelection/GroupsStep.vue';
import TemplateSelection from '@/components/NewBroadcast/TemplateSelection/TemplateSelection.vue';
import VariablesSelection from '@/components/NewBroadcast/VariablesSelection/VariablesSelection.vue';
import ConfirmAndSend from '@/components/NewBroadcast/ConfirmAndSend/ConfirmAndSend.vue';

const broadcastsStore = useBroadcastsStore();
const contactImportStore = useContactImportStore();
const projectStore = useProjectStore();
const templatesStore = useTemplatesStore();

const uploadFinished = ref(false);

onBeforeMount(() => {
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
  projectStore.getProjectInfo();
  projectStore.getProjectChannels();
  templatesStore.getTemplatePricing();
});

const isSelectGroupsPage = computed(
  () =>
    broadcastsStore.newBroadcast.currentPage === NewBroadcastPage.SELECT_GROUPS,
);

const isSelectTemplatePage = computed(
  () =>
    broadcastsStore.newBroadcast.currentPage ===
    NewBroadcastPage.SELECT_TEMPLATE,
);

const isSelectVariablesPage = computed(
  () =>
    broadcastsStore.newBroadcast.currentPage ===
    NewBroadcastPage.SELECT_VARIABLES,
);

const isConfirmAndSendPage = computed(
  () =>
    broadcastsStore.newBroadcast.currentPage ===
    NewBroadcastPage.CONFIRM_AND_SEND,
);

const handleBack = () => {
  broadcastsStore.resetNewBroadcast();
  contactImportStore.clearImport();
  uploadFinished.value = false;
};
</script>

<style scoped lang="scss">
.new-broadcast-layout {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    flex: 1;
  }

  &__contacts,
  &__template,
  &__variables,
  &__confirm-and-send {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}
</style>
