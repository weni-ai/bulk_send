<template>
  <section
    class="contact-import-upload-instructions"
    data-test="upload-instructions"
  >
    <I18nT
      :class="{
        'contact-import-upload-instructions__text': true,
        'contact-import-upload-instructions__text--disabled': disabled,
      }"
      keypath="new_broadcast.pages.contact_import.upload_instructions.text"
      tag="p"
    >
      <button
        :class="{
          'contact-import-upload-instructions__button': true,
          'contact-import-upload-instructions__button--disabled': disabled,
        }"
        data-test="open-modal"
        @click="() => handleModalUpdate(true)"
      >
        {{
          $t('new_broadcast.pages.contact_import.upload_instructions.button')
        }}
      </button>
    </I18nT>

    <ContactImportUploadInstructionsModal
      :open="openInstructionsModal"
      @update:open="handleModalUpdate"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContactImportUploadInstructionsModal from '@/components/NewBroadcast/ContactImport/modals/ContactImportUploadInstructionsModal.vue';

const openInstructionsModal = ref(false);

const props = defineProps<{
  disabled: boolean;
}>();

const handleModalUpdate = (value: boolean) => {
  if (props.disabled) return;
  openInstructionsModal.value = value;
};
</script>

<style lang="scss" scoped>
.contact-import-upload-instructions {
  display: flex;
  justify-content: center;
  align-items: center;

  &__text {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-dark;
  }

  &__button {
    @include unnnic-text-body-gt;
    @include button-reset;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
    text-decoration: underline;
    cursor: pointer;
  }

  &__text--disabled,
  &__button--disabled {
    color: $unnnic-color-neutral-clean;
  }
}
</style>
