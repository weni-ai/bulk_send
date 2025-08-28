<template>
  <section
    class="group-selection-overview"
    data-test="overview"
  >
    <section class="group-selection-overview__content">
      <h1
        class="group-selection-overview__title"
        data-test="overview-title"
      >
        {{ overviewTitle }}
      </h1>
      <section class="group-selection-overview__items">
        <section
          v-for="item in overviewItems"
          :key="item.key"
          class="group-selection-overview__item"
        >
          <p
            class="group-selection-overview__label"
            :data-test="`${item.key}-label`"
          >
            {{ item.label }}
          </p>
          <p
            class="group-selection-overview__value"
            :data-test="`${item.key}-value`"
          >
            {{ item.value }}
          </p>
        </section>
      </section>
    </section>
    <section
      class="group-selection-overview__removal"
      data-test="overview-remove"
      @click="handleRemoval"
    >
      <UnnnicToolTip
        class="group-selection-overview__removal-tooltip"
        :text="removalTooltipText"
        side="left"
        enabled
      >
        <UnnnicIcon
          class="group-selection-overview__removal-icon"
          icon="close"
        />
      </UnnnicToolTip>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Group } from '@/types/groups';
import { Currency } from '@/constants/currency';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  selectedGroups: Group[];
}>();

const emit = defineEmits(['remove']);

const templateMultiplier = 0.12; // TODO: get from backend
const templateCurrency = 'USD'; // TODO: get from backend

const overviewTitle = computed(() => {
  return t('new_broadcast.pages.select_groups.overview.title', {
    count: props.selectedGroups.length,
  });
});

const totalText = computed(() => {
  return t('new_broadcast.pages.select_groups.overview.total_value', {
    total: total.value,
  });
});

const costText = computed(() => {
  return t('new_broadcast.pages.select_groups.overview.cost_value', {
    cost: cost.value,
    currency: Currency[templateCurrency],
    templateMultiplier,
  });
});

const total = computed(() => {
  return props.selectedGroups.reduce(
    (acc, group) => acc + group.memberCount,
    0,
  );
});

const cost = computed(() => {
  return total.value * templateMultiplier;
});

const overviewItems = computed(() => {
  return [
    {
      key: 'total',
      label: t('new_broadcast.pages.select_groups.overview.total_label'),
      value: totalText.value,
    },
    {
      key: 'cost',
      label: t('new_broadcast.pages.select_groups.overview.cost_label'),
      value: costText.value,
    },
  ];
});

const removalTooltipText = computed(() =>
  t('new_broadcast.pages.select_groups.overview.removal_tooltip'),
);

const handleRemoval = () => {
  emit('remove');
};
</script>

<style lang="scss" scoped>
.group-selection-overview {
  display: flex;
  gap: $unnnic-spacing-nano;
  align-items: center;
  padding: $unnnic-spacing-xs;

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }

  &__title {
    @include unnnic-text-body-gt;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
  }

  &__items {
    display: flex;
    flex-direction: column;
  }

  &__item {
    display: inline-flex;
    gap: $unnnic-spacing-nano;
  }

  &__label {
    @include unnnic-text-body-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-cloudy;
  }

  &__value {
    @include unnnic-text-body-md;
    color: $unnnic-color-neutral-cloudy;
  }

  &__removal {
    margin-left: auto;
  }

  &__removal-tooltip {
    height: 20px; // fixed height as set in the design
  }

  &__removal-icon {
    cursor: pointer;
    font-size: 20px; // fixed size as set in the design
  }
}
</style>
