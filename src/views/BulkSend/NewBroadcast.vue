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
          <section
            v-if="!hasContactImport"
            class="new-broadcast-layout__content-groups"
          >
            <GroupSelection
              class="new-broadcast-layout__group-selection"
              :open="groupSelectionOpen"
              @update:open="handleGroupSelectionOpen"
            />
            <ContactImport
              :open="contactImportOpen"
              @update:open="handleContactImportOpen"
            />
          </section>

          <ContactImportProcessing v-if="hasContactImport" />
        </section>
        <section
          v-if="isSelectTemplatePage"
          class="new-broadcast-layout__template"
        >
          <TemplateSelection data-test="template-selection" />
        </section>
      </section>
      <!-- TODO: Move this into each step page for easier management? Answer: YES PLEASE -->
      <section class="new-broadcast-layout__content-actions">
        <UnnnicButton
          class="new-broadcast-layout__content-actions-cancel"
          type="tertiary"
          @click="handleCancel"
        >
          {{ $t('new_broadcast.pages.actions.cancel') }}
        </UnnnicButton>
        <UnnnicButton
          class="new-broadcast-layout__content-actions-continue"
          :disabled="!canContinue"
          @click="handleContinue"
        >
          {{ $t('new_broadcast.pages.actions.continue') }}
        </UnnnicButton>
      </section>
    </template>
  </NewBroadcastLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useContactImportStore } from '@/stores/contactImport';
import { useProjectStore } from '@/stores/project';
import { NewBroadcastPage } from '@/constants/broadcasts';
import NewBroadcastLayout from '@/layouts/BulkSend/NewBroadcastLayout.vue';
import NewBroadcastHeader from '@/components/NewBroadcast/NewBroadcastHeader.vue';
import GroupSelection from '@/components/NewBroadcast/GroupSelection/GroupSelection.vue';
import ContactImport from '@/components/NewBroadcast/ContactImport/ContactImport.vue';
import ContactImportProcessing from '@/components/NewBroadcast/ContactImport/ContactImportProcessing.vue';
import TemplateSelection from '@/components/NewBroadcast/TemplateSelection/TemplateSelection.vue';
import { TemplateStatus } from '@/constants/templates';

const router = useRouter();

const broadcastsStore = useBroadcastsStore();
const contactImportStore = useContactImportStore();
const projectStore = useProjectStore();

onBeforeMount(() => {
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
});

const groupSelectionOpen = computed(
  () => broadcastsStore.newBroadcast.groupSelectionOpen,
);
const contactImportOpen = computed(
  () => broadcastsStore.newBroadcast.contactImportOpen,
);

const isSelectGroupsPage = computed(
  () =>
    broadcastsStore.newBroadcast.currentPage === NewBroadcastPage.SELECT_GROUPS,
);

const isSelectTemplatePage = computed(
  () =>
    broadcastsStore.newBroadcast.currentPage ===
    NewBroadcastPage.SELECT_TEMPLATE,
);
const hasContactImport = computed(() => contactImportStore.import);

const canContinue = computed(() => {
  if (isSelectGroupsPage.value) {
    return (
      broadcastsStore.newBroadcast.selectedGroups.length > 0 ||
      contactImportStore.import
    );
  }

  if (isSelectTemplatePage.value) {
    return (
      broadcastsStore.newBroadcast.selectedTemplate &&
      broadcastsStore.newBroadcast.selectedTemplate.status ===
        TemplateStatus.APPROVED
    );
  }

  return false;
});

const canConfirmImport = computed(() => {
  return (
    broadcastsStore.newBroadcast.currentPage ===
      NewBroadcastPage.SELECT_GROUPS && contactImportStore.import
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

const handleCancel = () => {
  if (!canContinue.value) {
    // return to previous page
    router.back();
  }

  if (contactImportStore.import) {
    contactImportStore.clearImport();
  }

  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
};

// TODO: Refactor this to avoid so many if-elses
const handleContinue = () => {
  if (isSelectGroupsPage.value && canConfirmImport.value) {
    contactImportStore.confirmContactImport(
      projectStore.project.uuid,
      contactImportStore.import!.importId,
      contactImportStore.importProcessing,
    );

    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
  } else if (
    isSelectGroupsPage.value &&
    broadcastsStore.newBroadcast.selectedGroups.length > 0
  ) {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
  } else if (isSelectTemplatePage.value) {
    broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_VARIABLES);
  }
};

const handleBack = () => {
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
  contactImportStore.clearImport();
};
</script>

<style scoped lang="scss">
.new-broadcast-layout {
  &__group-selection::after {
    content: '';
    display: block;
    width: 100%;
    height: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }

  &__content-actions {
    display: flex;
    margin-top: auto;
    gap: $unnnic-spacing-sm;
  }

  &__content-actions-cancel,
  &__content-actions-continue {
    flex: 1;
  }
}
</style>
