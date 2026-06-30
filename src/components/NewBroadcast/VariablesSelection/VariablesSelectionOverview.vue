<template>
  <section
    class="variables-selection-overview"
    data-test="variables-overview"
  >
    <h1
      v-if="title"
      class="variables-selection-overview__title"
      data-test="variables-overview-title"
    >
      {{ title }}
    </h1>
    <section class="variables-selection-overview__list">
      <section
        v-for="(variable, index) in definedVariables"
        :key="variable.key"
        class="variables-selection-overview__item"
        data-test="variables-overview-item"
      >
        <p
          class="variables-selection-overview__item-label"
          data-test="variables-overview-item-label"
        >
          {{ getVariableLabel(index + 1) }}
        </p>
        <UnnnicIcon
          icon="arrow_right_alt"
          scheme="neutral-dark"
        />
        <p
          class="variables-selection-overview__item-value"
          data-test="variables-overview-item-value"
        >
          {{ variable.label }}
        </p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { useVariableLabel } from '@/components/NewBroadcast/VariablesSelection/composables/useVariableLabel';
import type { ContactField } from '@/types/contacts';

const { getVariableLabel } = useVariableLabel();

defineProps<{
  title?: string;
  definedVariables: ContactField[];
}>();
</script>

<style scoped lang="scss">
.variables-selection-overview {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  border: 1px solid $unnnic-color-border-base;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-ant;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-fg-base;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }

  &__item {
    @include unnnic-text-body-gt;
    display: flex;
    gap: $unnnic-spacing-nano;
    align-items: center;
  }

  &__item-label {
    color: $unnnic-color-fg-base;
  }

  &__item-value {
    color: $unnnic-color-fg-base;
  }
}
</style>
