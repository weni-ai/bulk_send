<template>
  <UnnnicCollapse
    :modelValue="open"
    @update:model-value="handleCollapseUpdate"
  >
    <template #header>
      <h1 class="contact-import__title">
        {{ $t('new_broadcast.pages.contact_import.title') }}
      </h1>
    </template>
    <section class="contact-import__content">
      <UnnnicDisclaimer
        v-if="hasSelectedGroups"
        icon="info"
        :text="
          $t('new_broadcast.pages.contact_import.selected_groups_disclaimer')
        "
      />

      <ContactImportUpload :disabled="hasSelectedGroups" />
    </section>
  </UnnnicCollapse>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import ContactImportUpload from '@/components/NewBroadcast/ContactImport/ContactImportUpload.vue';

const broadcastsStore = useBroadcastsStore();

defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['update:open']);

const selectedGroups = computed(
  () => broadcastsStore.newBroadcast.selectedGroups,
);

const handleCollapseUpdate = (value: boolean) => {
  emit('update:open', value);
};

const hasSelectedGroups = computed(() => selectedGroups.value.length > 0);
</script>

<style lang="scss" scoped>
.contact-import {
  padding: unset;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }
}
</style>
