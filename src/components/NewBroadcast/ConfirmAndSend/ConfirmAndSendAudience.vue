<template>
  <section class="confirm-and-send-audience">
    <h2>
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

  switch (selectedTemplate.category) {
    case TemplateCategory.MARKETING:
      return templatesStore.teplatePricing.rates.marketing;
    case TemplateCategory.UTILITY:
      return templatesStore.teplatePricing.rates.utility;
    case TemplateCategory.AUTHENTICATION:
      return templatesStore.teplatePricing.rates.authentication;
    case TemplateCategory.SERVICE:
      return templatesStore.teplatePricing.rates.service;
    default:
      return 0;
  }
});

const cost = computed(() => {
  const totalCost = contactCount.value * templateUnitCost.value;
  const currency = Currency[templatesStore.teplatePricing.currency];
  return `${currency}${totalCost.toFixed(2)}`;
});

const unitCost = computed(() => {
  const currency = Currency[templatesStore.teplatePricing.currency];

  const unitCost = `${currency}${templateUnitCost.value.toFixed(2)}`;

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
