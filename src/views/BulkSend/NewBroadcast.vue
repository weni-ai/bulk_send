<template>
  <NewBroadcastLayout>
    <template #header>
      <NewBroadcastHeader />
    </template>
    <template #content>
      <section class="new-broadcast-layout__content">
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
    </template>
  </NewBroadcastLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { NewBroadcastPage } from '@/constants/broadcasts';
import NewBroadcastLayout from '@/layouts/BulkSend/NewBroadcastLayout.vue';
import NewBroadcastHeader from '@/components/NewBroadcast/NewBroadcastHeader.vue';
import GroupSelection from '@/components/NewBroadcast/GroupSelection/GroupSelection.vue';
import ContactImport from '@/components/NewBroadcast/ContactImport/ContactImport.vue';

const broadcastsStore = useBroadcastsStore();

onBeforeMount(() => {
  broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_GROUPS);
});

const groupSelectionOpen = computed(
  () => broadcastsStore.newBroadcast.groupSelectionOpen,
);
const contactImportOpen = computed(
  () => broadcastsStore.newBroadcast.contactImportOpen,
);

const handleGroupSelectionOpen = (value: boolean) => {
  broadcastsStore.setGroupSelectionOpen(value);
  broadcastsStore.setContactImportOpen(!value);
};

const handleContactImportOpen = (value: boolean) => {
  broadcastsStore.setContactImportOpen(value);
  broadcastsStore.setGroupSelectionOpen(!value);

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
}
</style>
