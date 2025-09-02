<template>
  <section class="contact-import-processing-overview">
    <section class="contact-import-processing-overview__content">
      <h1
        class="contact-import-processing-overview__file-name"
        data-test="overview-file-name"
      >
        {{ fileName }}
      </h1>
      <p
        class="contact-import-processing-overview__contact-count"
        data-test="overview-contact-count"
      >
        {{
          $t(
            'new_broadcast.pages.contact_import.processing.overview.contact_count',
            {
              count: contactCount,
            },
          )
        }}
      </p>
    </section>
    <section
      class="contact-import-processing-overview__removal"
      data-test="overview-remove"
      @click="handleRemoval"
    >
      <UnnnicIcon
        class="contact-import-processing-overview__removal-icon"
        icon="close"
        size="sm"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useContactImportStore } from '@/stores/contactImport';

const contactImportStore = useContactImportStore();

const fileName = computed(() => {
  return contactImportStore.import?.file.name;
});

const contactCount = computed(() => {
  return contactImportStore.import?.numRecords;
});

const handleRemoval = () => {
  contactImportStore.clearImport();
};
</script>

<style lang="scss" scoped>
.contact-import-processing-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $unnnic-spacing-nano;
  box-sizing: border-box;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-xs;

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__file-name {
    @include unnnic-text-body-gt;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__contact-count {
    @include unnnic-text-body-md;
    color: $unnnic-color-neutral-cloudy;
  }

  &__removal {
    display: flex;
  }

  &__removal-icon {
    cursor: pointer;
    width: $unnnic-font-size-title-sm;
    height: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm;
    text-align: center;
  }
}
</style>
