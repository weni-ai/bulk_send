<template>
  <section class="contact-import-upload">
    <section
      v-if="!isUploading"
      class="contact-import-upload__upload-area"
    >
      <UnnnicDropArea
        :class="{
          'contact-import-upload__drop-area': true,
          'contact-import-upload__drop-area--disabled': disabled,
        }"
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
            :class="{
              'contact-import-upload__title': true,
              'contact-import-upload__title--disabled': disabled,
            }"
            keypath="new_broadcast.pages.contact_import.upload_area.title.text"
            tag="span"
          >
            <button
              :class="{
                'contact-import-upload__title-highlight': true,
                'contact-import-upload__title-highlight--disabled': disabled,
              }"
            >
              {{
                $t(
                  'new_broadcast.pages.contact_import.upload_area.title.highlight',
                )
              }}
            </button>
          </I18nT>
        </template>
        <template #subtitle>
          <h2
            :class="{
              'contact-import-upload__subtitle': true,
              'contact-import-upload__subtitle--disabled': disabled,
            }"
          >
            {{ $t('new_broadcast.pages.contact_import.upload_area.subtitle') }}
          </h2>
        </template>
      </UnnnicDropArea>

      <ContactImportUploadInstructions :disabled="disabled" />
    </section>

    <ContactImportUploadProgress
      v-else
      :fileName="currentFileName"
      :fileSize="currentFileSize"
      :uploadProgress="uploadProgress || 0"
      :loading="isFinishing"
      @close="handleCancel"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import unnnic from '@weni/unnnic-system';
import { useContactImportStore } from '@/stores/contactImport';
import ContactImportUploadInstructions from '@/components/NewBroadcast/ContactImport/ContactImportUploadInstructions.vue';
import ContactImportUploadProgress from '@/components/NewBroadcast/ContactImport/ContactImportUploadProgress.vue';
import { useUploadProgress } from '@/composables/useUploadProgress';
import { isCanceledUploadError } from '@/utils/uploadError';

const { t } = useI18n();
const emit = defineEmits(['finished']);

const contactImportStore = useContactImportStore();

defineProps<{
  disabled: boolean;
}>();

const currentFiles = ref<File[]>([]);
const SUPPORTED_FILE_TYPES = ['.csv', '.xls', '.xlsx'];

const supportedFormats = computed(() => {
  return SUPPORTED_FILE_TYPES.join(',');
});

const currentFile = computed(() => currentFiles.value[0]);
const currentFileName = computed(() => currentFile.value?.name || '');
const currentFileSize = computed(() =>
  (currentFile.value?.size ?? 0).toString(),
);
const LOADING_DELAY = 1500;

const {
  uploadProgress,
  isUploading,
  resetProgressState,
  onUploadProgress,
  completeUpload,
  cancelProgress,
} = useUploadProgress({
  onFinished: () => {
    isFinishing.value = true;
    setTimeout(() => emit('finished'), LOADING_DELAY);
  },
});

const isFinishing = ref(false);

const handleFileUpload = async (files: File[]) => {
  isFinishing.value = false;
  resetProgressState();
  currentFiles.value = files;
  const file = files[0];
  try {
    await contactImportStore.uploadContactImport(file, (progressEvent) => {
      onUploadProgress(progressEvent.progress);
    });

    completeUpload();
  } catch (error) {
    cancelProgress();
    if (!isCanceledUploadError(error)) {
      handleFileUploadError(error);
    }
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

const handleCancel = () => {
  cancelProgress();
  contactImportStore.cancelUpload();
  isFinishing.value = false;
  currentFiles.value = [];
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

  &__title--disabled,
  &__title-highlight--disabled,
  &__subtitle--disabled {
    color: $unnnic-color-neutral-clean;
  }

  &__upload-area {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__drop-area:deep(.unnnic-upload-area__dropzone__icon) {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-title-sm;
  }

  &__drop-area--disabled:deep(.unnnic-upload-area__dropzone__icon) {
    color: $unnnic-color-neutral-clean;
  }

  &__upload-progress-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
