<template>
  <section class="missing-recent-sends">
    <img :src="loadAsset('svgs/campaign.svg')" alt="Campaign Icon" />
    <section class="missing-recent-sends__content">
      <p class="missing-recent-sends__title">
        {{ $t('home.no_recent_sends.title') }}
      </p>
      <p class="missing-recent-sends__subtitle">
        {{ $t('home.no_recent_sends.subtitle') }}
      </p>
    </section>
    <UnnnicButton :text="$t('home.no_recent_sends.button')" type="secondary" @click="handleButtonClick" />
  </section>
</template>

<script setup lang="ts">
import { loadAsset } from '@/utils/assets'

const emit = defineEmits(['start-new-send'])

const handleButtonClick = () => {
  emit('start-new-send')
}
</script>

<style lang="scss" scoped>
.missing-recent-sends {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;

  &__content {
    margin: $unnnic-spacing-sm 0;
    text-align: cente
  }

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

    margin-bottom: $unnnic-spacing-nano;
  }

  &__subtitle {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>