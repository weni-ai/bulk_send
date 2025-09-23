<template>
  <section class="confirm-and-send-audience">
    <h2 class="confirm-and-send-audience__title">
      {{ $t('new_broadcast.pages.confirm_and_send.audience.title') }}
    </h2>

    <I18nT
      class="confirm-and-send-audience__item"
      keypath="new_broadcast.pages.confirm_and_send.audience.groups"
      tag="p"
    >
      <span class="confirm-and-send-audience__value">
        {{ groupsNames }}
      </span>
    </I18nT>

    <I18nT
      class="confirm-and-send-audience__item"
      keypath="new_broadcast.pages.confirm_and_send.audience.contacts"
      tag="p"
    >
      <span class="confirm-and-send-audience__value">
        {{ contactCount }}
      </span>
    </I18nT>

    <I18nT
      class="confirm-and-send-audience__item"
      keypath="new_broadcast.pages.confirm_and_send.audience.cost"
      tag="p"
    >
      <span class="confirm-and-send-audience__value">
        {{ cost }}
      </span>
      <span class="confirm-and-send-audience__value">
        {{ unitCost }}
      </span>
    </I18nT>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useContactImportStore } from '@/stores/contactImport';
import { useTemplatesStore } from '@/stores/templates';
import { Currency } from '@/constants/currency';
import { TemplateCategory } from '@/constants/templates';
import { toLocalizedFloat } from '@/utils/number';

const { t } = useI18n();
const broadcastsStore = useBroadcastsStore();
const contactImportStore = useContactImportStore();
const templatesStore = useTemplatesStore();

const groupsNames = computed(() => {
  if (contactImportStore.import) {
    return contactImportStore.importProcessing.groupName;
  } else {
    return broadcastsStore.newBroadcast.selectedGroups
      .map((group) => group.name)
      .join(', ');
  }
});

const contactCount = computed(() => {
  if (contactImportStore.import) {
    return contactImportStore.import.numRecords;
  } else {
    return broadcastsStore.newBroadcast.selectedGroups.reduce(
      (acc, group) => acc + group.memberCount,
      0,
    );
  }
});

const templateUnitCost = computed(() => {
  const selectedTemplate = broadcastsStore.newBroadcast.selectedTemplate;

  if (!selectedTemplate) {
    return 0;
  }

  const rates = templatesStore.templatePricing.rates;
  const categoryToRate = {
    [TemplateCategory.MARKETING]: rates.marketing,
    [TemplateCategory.UTILITY]: rates.utility,
    [TemplateCategory.AUTHENTICATION]: rates.authentication,
    [TemplateCategory.SERVICE]: rates.service,
  };

  return categoryToRate[selectedTemplate.category] ?? 0;
});

const cost = computed(() => {
  const totalCost = contactCount.value * templateUnitCost.value;
  const currency = Currency[templatesStore.templatePricing.currency];
  return `${currency}${toLocalizedFloat(totalCost)}`;
});

const unitCost = computed(() => {
  const currency = Currency[templatesStore.templatePricing.currency];

  const unitCost = `${currency}${toLocalizedFloat(templateUnitCost.value)}`;

  return t('new_broadcast.pages.confirm_and_send.audience.unit_cost', {
    unitCost,
  });
});
</script>

<style scoped lang="scss">
.confirm-and-send-audience {
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
    color: $unnnic-color-neutral-dark;
  }

  &__value {
    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
