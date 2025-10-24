<template>
  <section
    :class="{
      'group-selection-option': true,
      'group-selection-option--selected': selected,
    }"
    data-test="group-option"
    :data-selected="selected"
    @click="emitSelectionUpdate"
  >
    <UnnnicCheckbox
      class="group-selection-option__checkbox"
      data-test="group-option-checkbox"
      :modelValue="selected"
      size="sm"
    />
    <section class="group-selection-option__content">
      <h1
        class="group-selection-option__title"
        data-test="group-option-title"
      >
        {{ title }}
      </h1>
      <p
        class="group-selection-option__description"
        data-test="group-option-description"
      >
        {{ description }}
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  selected: boolean;
}>();

const emit = defineEmits(['update:selected']);

const emitSelectionUpdate = () => {
  emit('update:selected', !props.selected);
};
</script>

<style scoped lang="scss">
.group-selection-option {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-nano;
  box-sizing: border-box;
  padding: $unnnic-spacing-xs;

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-light;
  border-radius: $unnnic-border-radius-sm;
  width: 100%;
  cursor: pointer;

  &:hover {
    border-color: $unnnic-color-neutral-soft;
  }

  &--selected {
    background-color: $unnnic-color-background-lightest;
    border-color: $unnnic-color-neutral-soft;
  }

  &__content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__title {
    @include unnnic-text-body-gt;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__description {
    @include unnnic-text-body-md;
    color: $unnnic-color-neutral-cloudy;
  }

  &__checkbox {
    padding: $unnnic-spacing-nano;
  }
}
</style>
