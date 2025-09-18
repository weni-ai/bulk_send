<template>
  <section class="contact-import-processing">
    <header class="contact-import-processing__header">
      <h1 class="contact-import-processing__title">
        {{ $t('new_broadcast.pages.contact_import.processing.title') }}
      </h1>

      <ContactImportProcessingOverview />

      <UnnnicDisclaimer
        v-if="duplicatedContactsCount"
        class="contact-import-processing__duplicated-contacts-disclaimer"
        icon="info"
        :text="
          $t(
            'new_broadcast.pages.contact_import.processing.duplicated_contacts_disclaimer',
            {
              count: duplicatedContactsCount,
            },
          )
        "
        @click="(event: Event) => downloadDuplicates(event)"
      />
    </header>
    <section class="contact-import-processing__content">
      <ContactImportProcessingMapping />
      <ContactImportProcessingForm />
    </section>
  </section>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, computed } from 'vue';
import { useContactImportStore } from '@/stores/contactImport';
import { useGroupsStore } from '@/stores/groups';
import { useProjectStore } from '@/stores/project';
import ContactImportProcessingOverview from '@/components/NewBroadcast/ContactImport/ContactImportProcessingOverview.vue';
import ContactImportProcessingMapping from '@/components/NewBroadcast/ContactImport/ContactImportProcessingMapping.vue';
import ContactImportProcessingForm from '@/components/NewBroadcast/ContactImport/ContactImportProcessingForm.vue';

const contactImportStore = useContactImportStore();

const groupsStore = useGroupsStore();
const projectStore = useProjectStore();

const duplicatedContactsCount = computed(() => {
  return contactImportStore.import?.duplicates.count || 0;
});

onBeforeMount(() => {
  listAllGroups();
});

onMounted(() => {
  contactImportStore.setProcessingGroupName(
    removeExtensionFromFileName(contactImportStore.import?.file.name) || '',
  );
});

const removeExtensionFromFileName = (fileName?: string) => {
  if (!fileName) return '';
  return fileName.split('.').slice(0, -1).join('.');
};

const listAllGroups = async () => {
  try {
    await groupsStore.listAllGroups(projectStore.project.uuid);
  } catch (error) {
    console.error(error); // TODO: handle error
  }
};

const downloadDuplicates = (event: Event) => {
  event.preventDefault();
  const target = event.target as HTMLElement;
  if (target.closest('button')) {
    window.open(contactImportStore.import?.duplicates.downloadUrl, '_blank');
  }
};
</script>

<style lang="scss" scoped>
.contact-import-processing {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &__header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-md;
  }

  &__duplicated-contacts-disclaimer {
    display: flex;
    flex-direction: row;
    padding: $unnnic-spacing-xs;

    :deep(.unnnic-disclaimer__text) {
      @include unnnic-text-body-md;
      color: $unnnic-color-neutral-cloudy;
    }

    :deep(.highlight) {
      @include unnnic-text-body-md;
      color: $unnnic-color-neutral-cloudy;
      text-decoration: underline;
      font-weight: $unnnic-font-weight-bold;
      cursor: pointer;

      border: none;
      background: none;
      padding: 0;
    }
  }
}
</style>
