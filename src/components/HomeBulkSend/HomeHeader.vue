<template>
  <header class="header">
    <div class="header-content">
      <h1 class="title">{{ $t('home.title') }}</h1>
      <p class="description">{{ $t('home.description') }}</p>
    </div>

    <UnnnicButton :text="$t('home.new_send')" type="primary" iconLeft="add-1" />
  </header>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-spacing-sm;

  & .header-content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    width: 100%;
  }

  & .title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  }

  & .description {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
