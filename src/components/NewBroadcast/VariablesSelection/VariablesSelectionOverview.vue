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
        {{
          $t('new_broadcast.pages.select_variables.variable_label', {
            index: index + 1,
          })
        }}
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
</template>

<script setup lang="ts">
import type { ContactField } from '@/types/contacts';

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

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-ant;

  &__title {
    @include unnnic-text-body-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
  }

  &__item {
    @include unnnic-text-body-gt;
    display: flex;
    gap: $unnnic-spacing-nano;
    align-items: center;
  }

  &__item-label {
    color: $unnnic-color-neutral-dark;
  }

  &__item-value {
    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
