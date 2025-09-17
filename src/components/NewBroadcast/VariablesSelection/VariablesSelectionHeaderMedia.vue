<template>
  <section class="header-media">
    <h1 class="header-media__title">
      {{ $t('new_broadcast.pages.select_variables.header_media_title') }}
    </h1>

    <UnnnicButton
      v-if="!mediaHeaderFile"
      class="header-media__button"
      :text="
        $t(
          `new_broadcast.pages.select_variables.header_media_button.${mediaHeaderType}`,
        )
      "
      type="secondary"
      iconLeft="add-1"
      @click="openMediaSelection"
    />

    <section
      v-else
      class="header-media__overview"
    >
      <section class="header-media__overview-content">
        <section class="header-media__overview-icon">
          <UnnnicIcon
            :icon="mediaHeaderIcon"
            size="md"
          />
        </section>

        <p class="header-media__overview-file-name">
          {{ mediaHeaderFile?.name }}
        </p>
      </section>

      <section
        :class="{
          'header-media__overview-action': true,
          'header-media__overview-action--spinning': isUploadingMedia,
        }"
        @click="handleMediaOverviewRemove"
      >
        <UnnnicIcon
          :icon="actionIcon"
          size="ant"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import unnnic from '@weni/unnnic-system';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBroadcastsStore } from '@/stores/broadcasts';

const broadcastsStore = useBroadcastsStore();
const { t } = useI18n();

const mediaHeaderFile = computed(() => {
  return broadcastsStore.newBroadcast.headerMediaFile;
});

const isUploadingMedia = computed(() => {
  return broadcastsStore.loadingUploadMedia;
});

const mediaHeaderType = computed(() => {
  return broadcastsStore.newBroadcast.selectedTemplate?.header?.type;
});

const mediaHeaderAcceptedFormats = computed(() => {
  switch (mediaHeaderType.value) {
    case 'IMAGE':
      return 'image/*';
    case 'VIDEO':
      return 'video/*';
    case 'DOCUMENT':
      return 'application/pdf';
    default:
      return '';
  }
});

const mediaHeaderIcon = computed(() => {
  switch (mediaHeaderType.value) {
    case 'IMAGE':
      return 'image';
    case 'VIDEO':
      return 'video_library';
    case 'DOCUMENT':
      return 'draft';
    default:
      return '';
  }
});

const actionIcon = computed(() => {
  return isUploadingMedia.value ? 'progress_activity' : 'delete';
});

const handleMediaSelection = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  broadcastsStore.setHeaderMediaFile(file);

  if (file) {
    try {
      await broadcastsStore.uploadMedia(file);
    } catch {
      broadcastsStore.setHeaderMediaFile(undefined);
      unnnic.unnnicCallAlert({
        props: {
          text: t(
            'new_broadcast.pages.select_variables.header_media_upload_error',
          ),
          type: 'error',
        },
        seconds: 10,
      });
    }
  }
};

const openMediaSelection = () => {
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = mediaHeaderAcceptedFormats.value;
  file.onchange = handleMediaSelection;
  file.click();
};

const handleMediaOverviewRemove = () => {
  if (isUploadingMedia.value) {
    return;
  }

  broadcastsStore.setHeaderMediaFileUrl(undefined);
  broadcastsStore.setHeaderMediaFile(undefined);
};
</script>

<style scoped lang="scss">
.header-media {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }

  &__button {
    align-self: flex-start;
  }

  &__overview {
    display: flex;
    gap: $unnnic-spacing-xs;
    align-items: center;

    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-ant;
  }

  &__overview-content {
    display: flex;
    gap: $unnnic-spacing-ant;
    align-items: center;
    flex: 1;
  }

  &__overview-icon {
    width: 42px; // fixed width as set in the design
    height: 42px; // fixed height as set in the design

    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-gray-50;
  }

  &__overview-file-name {
    @include unnnic-text-body-gt;
    color: $unnnic-color-gray-900;
    flex: 1;
  }

  &__overview-action {
    &--spinning {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
