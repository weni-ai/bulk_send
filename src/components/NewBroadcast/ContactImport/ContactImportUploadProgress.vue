<template>
  <section class="contact-import-upload-progress">
    <section
      v-if="loading"
      class="contact-import-upload-progress__loading"
      data-test="upload-progress-loading"
    >
      <img
        :src="weniLoading"
        width="40"
        height="40"
      />
    </section>
    <section
      v-else
      class="contact-import-upload-progress__file"
    >
      <section class="contact-import-upload-progress__file-info">
        <h1 class="contact-import-upload-progress__file-name">
          {{ fileName }}
        </h1>
        <p class="contact-import-upload-progress__file-size">
          {{ fileSizeInMB }}
        </p>
      </section>
      <section class="contact-import-upload-progress__progress">
        <UnnnicProgressBar :modelValue="uploadProgress" />
        <section
          class="contact-import-upload-progress__cancel"
          data-test="upload-progress-cancel"
          @click="handleClose"
        >
          <UnnnicIcon
            icon="close"
            size="sm"
          />
        </section>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import weniLoading from '@/assets/images/weni-loading.svg';

const props = defineProps<{
  fileName: string;
  fileSize: string;
  uploadProgress: number;
  loading: boolean;
}>();

const emit = defineEmits(['close']);

const fileSizeInMB = computed(() => {
  return `${(Number(props.fileSize) / 1024 / 1024).toFixed(2)}MB`;
});

const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
.contact-import-upload-progress {
  display: flex;
  flex: 1;

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  &__file {
    display: flex;
    gap: $unnnic-spacing-sm;
    flex: 1;
    padding: $unnnic-spacing-sm;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-md;
  }

  &__file-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    @include unnnic-text-body-gt;
  }

  &__file-name {
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__file-size {
    color: $unnnic-color-neutral-cloudy;
  }

  &__progress {
    display: flex;
    gap: $unnnic-spacing-sm;
    height: stretch;
    height: -moz-available;
    height: -webkit-fill-available;
    align-items: center;

    &:deep(.unnnic-progress-bar) {
      background-color: unset;
      box-shadow: unset;
      border: unset;
      border-radius: unset;
      padding: unset;

      .progress-container {
        height: 4px !important;
        background-color: $unnnic-color-teal-100 !important;

        .bar {
          background-color: $unnnic-color-teal-600 !important;
        }
      }

      .percentage {
        @include unnnic-text-body-gt;
      }
    }
  }

  &__cancel {
    cursor: pointer;
    align-self: start;
  }
}
</style>
