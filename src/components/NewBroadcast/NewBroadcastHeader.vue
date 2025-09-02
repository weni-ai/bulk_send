<template>
  <header class="new-broadcast-header">
    <section class="new-broadcast-header__title-container">
      <UnnnicButton
        class="new-broadcast-header__back-button"
        type="tertiary"
        iconLeft="arrow_back"
        @click="handleBackButtonClick"
      />
      <h1 class="new-broadcast-header__title-text">
        {{ $t('new_broadcast.title') }}
      </h1>
    </section>
    <section class="new-broadcast-header__navigator">
      <NewBroadcastNavigator />
    </section>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import NewBroadcastNavigator from '@/components/NewBroadcast/NewBroadcastNavigator.vue';

const router = useRouter();

const emit = defineEmits(['back']);

const handleBackButtonClick = () => {
  emit('back');
  router.back();
};
</script>

<style scoped lang="scss">
.new-broadcast-header {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title-container {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-sm;
  }

  &__title-text {
    color: $unnnic-color-neutral-darkest;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  }
}
</style>
