<template>
  <section class="contact-import-upload">
    <!-- TODO: add disabled in design system -->
    <UnnnicDropArea
      class="contact-import-upload__drop-area"
      :currentFiles="currentFiles"
      :supportedFormats="supportedFormats"
      :acceptMultiple="false"
      :disabled="disabled"
      @update:current-files="handleFileUpload"
      @on-unsupported-format="handleUnsupportedFormat"
      @on-exceeded-the-maximum-file-size-limit="
        handleExceededTheMaximumFileSizeLimit
      "
    >
      <template #title>
        <I18nT
          class="contact-import-upload__title"
          keypath="new_broadcast.pages.contact_import.upload_area.title.text"
          tag="span"
        >
          <button class="contact-import-upload__title-highlight">
            {{
              $t(
                'new_broadcast.pages.contact_import.upload_area.title.highlight',
              )
            }}
          </button>
        </I18nT>
      </template>
      <template #subtitle>
        <h2 class="contact-import-upload__subtitle">
          {{ $t('new_broadcast.pages.contact_import.upload_area.subtitle') }}
        </h2>
      </template>
    </UnnnicDropArea>

    <ContactImportUploadInstructions />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import unnnic from '@weni/unnnic-system';
import { useContactImportStore } from '@/stores/contactImport';
import ContactImportUploadInstructions from '@/components/NewBroadcast/ContactImport/ContactImportUploadInstructions.vue';

const { t } = useI18n();

const contactImportStore = useContactImportStore();

defineProps<{
  disabled: boolean;
}>();

const currentFiles = ref<File[]>([]);
const SUPPORTED_FILE_TYPES = ['.csv', '.xls', '.xlsx'];

const supportedFormats = computed(() => {
  return SUPPORTED_FILE_TYPES.join(',');
});

const handleFileUpload = async (files: File[]) => {
  currentFiles.value = files;
  const file = files[0];
  try {
    await contactImportStore.uploadContactImport(file);
  } catch (error) {
    handleFileUploadError(error);
  }
};

const handleFileUploadError = (error: unknown) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : t('new_broadcast.pages.contact_import.upload_area.unknown_error_alert');
  unnnic.unnnicCallAlert({
    props: {
      text: errorMessage,
      type: 'error',
    },
    seconds: 10,
  });
  currentFiles.value = [];
};

const handleUnsupportedFormat = () => {
  unnnic.unnnicCallAlert({
    props: {
      text: t(
        'new_broadcast.pages.contact_import.upload_area.unsupported_format_alert',
      ),
      type: 'error',
    },
    seconds: 10,
  });
};

const handleExceededTheMaximumFileSizeLimit = () => {
  unnnic.unnnicCallAlert({
    props: {
      text: t(
        'new_broadcast.pages.contact_import.upload_area.exceeded_the_maximum_file_size_limit_alert',
      ),
      type: 'error',
    },
    seconds: 10,
  });
};
</script>

<style lang="scss" scoped>
.contact-import-upload {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-dark;
  }

  &__title-highlight {
    @include unnnic-text-body-gt;
    @include button-reset;
    color: $unnnic-color-neutral-dark;
    font-weight: $unnnic-font-weight-bold;
    text-decoration: underline;
    cursor: pointer;
  }

  &__subtitle {
    @include unnnic-text-body-gt;
    color: $unnnic-color-neutral-dark;
    margin-top: $unnnic-spacing-md;
  }

  &__drop-area:deep(.unnnic-upload-area__dropzone__icon) {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-title-sm;
  }
}
</style>
