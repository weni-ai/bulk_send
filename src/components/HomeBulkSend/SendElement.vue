<template>
  <UnnnicCollapse class="send-element">
    <template #header>
      <header class="send-element__header">
        <h2
          class="send-element__title"
          data-test="title"
        >
          {{ send.name }}
        </h2>
        <p
          class="send-element__date"
          data-test="date"
        >
          {{ date }}
        </p>
        <UnnnicTag
          :class="`send-element__tag send-element__tag--${tagScheme}`"
          :text="sendStatusText"
        />
      </header>
    </template>

    <section class="send-element__content">
      <SendElementInfo
        class="send-element__info"
        :send="send"
      />
      <MetricsTable
        class="send-element__metrics"
        :data="sendMetrics"
        :maxColumns="3"
        size="sm"
        nearTooltip
      />
    </section>

    <NewContactGroupModal
      v-if="showNewGroupModal"
      :modelValue="showNewGroupModal"
      :contactCount="modalContactCount"
      :category="modalCategory"
      :broadcastName="modalBroadcastName"
      :broadcastID="send.id"
      @update:model-value="handleUpdateShowNewGroupModal"
    />
  </UnnnicCollapse>
</template>

<script setup lang="ts">
import MetricsTable from '@/components/MetricsTable.vue';
import SendElementInfo from '@/components/HomeBulkSend/SendElementInfo.vue';
import NewContactGroupModal from '@/components/modals/NewContactGroup.vue';
import type { BroadcastStatistic } from '@/types/broadcast';
import { BroadcastStatus, ContactGroupStatus } from '@/constants/broadcasts';
import { formatDateWithTimezone } from '@/utils/date';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getEnumKeyByValue } from '@/utils/enum';
import { Currency } from '@/constants/currency';
import { toLocalizedFloat, toPercentage } from '@/utils/number';
const { t } = useI18n();

const props = defineProps<{
  send: BroadcastStatistic;
}>();

const tagScheme = computed(() => {
  if (props.send.status === BroadcastStatus.SENT) {
    return 'aux-green';
  }
  return 'aux-orange';
});

const date = computed(() => {
  return formatDateWithTimezone(props.send.createdOn, 'dd/MM/yyyy');
});

const showNewGroupModal = ref(false);
const modalCategory = ref<keyof typeof ContactGroupStatus | null>(null);
const modalBroadcastName = ref('');
const modalContactCount = ref(0);

const displayNewGroupModal = (
  category: keyof typeof ContactGroupStatus,
  broadcastName: string,
) => {
  modalCategory.value = category;
  modalBroadcastName.value = broadcastName;
  modalContactCount.value = Number(props.send.statistics[category]) || 0;
  showNewGroupModal.value = true;
};

const handleUpdateShowNewGroupModal = (value: boolean) => {
  showNewGroupModal.value = value;
};

const sendMetrics = computed(() => {
  // TODO: update hints when design is ready
  return [
    {
      label: t('home.recent_sends.metrics.processed.label'),
      value: processedValue.value || '-',
      subValue: processedPercentage.value,
      hint: t('home.recent_sends.metrics.sent.hint'),
    },
    {
      label: t('home.recent_sends.metrics.sent.label'),
      value: props.send.statistics.sent?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.clicked.hint'),
    },
    {
      label: t('home.recent_sends.metrics.delivered.label'),
      value: deliveredPercentage.value,
      subValue: props.send.statistics.delivered?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.delivered.hint'),
      actions: [newGroupAction('delivered')],
    },
    {
      label: t('home.recent_sends.metrics.read.label'),
      value: readPercentage.value,
      subValue: props.send.statistics.read?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.read.hint'),
      actions: [newGroupAction('read')],
    },
    {
      label: t('home.recent_sends.metrics.failed.label'),
      value: failedPercentage.value,
      subValue: props.send.statistics.failed?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.failed.hint'),
      actions: [newGroupAction('failed')],
    },
    {
      label: t('home.recent_sends.metrics.estimated_cost.label'),
      value: estimatedCost.value,
      hint: t('home.recent_sends.metrics.estimated_cost.hint', {
        currency: 'US$', // TODO: get currency from backend when ready
        cost: '0.12', // TODO: get cost from backend when ready
      }),
    },
  ];
});

const newGroupAction = (category: keyof typeof ContactGroupStatus) => {
  return {
    label: t('home.recent_sends.metrics.actions.add_to_a_new_group'),
    icon: 'add',
    onClick: () => {
      displayNewGroupModal(category, props.send.name);
    },
  };
};

const sendStatusText = computed(() => {
  return t(
    `home.recent_sends.status.${getEnumKeyByValue(BroadcastStatus, props.send.status)}`,
  );
});

const getPercentage = (value: number, total: number) => {
  if (!total) {
    return '0%';
  }

  const result = (value / total) * 100;
  return `${toPercentage(result)}`;
};

const deliveredPercentage = computed(() => {
  return getPercentage(
    props.send.statistics.delivered,
    props.send.statistics.sent,
  );
});

const readPercentage = computed(() => {
  return getPercentage(props.send.statistics.read, props.send.statistics.sent);
});

const failedPercentage = computed(() => {
  return getPercentage(
    props.send.statistics.failed,
    props.send.statistics.contactCount,
  );
});

const processedValue = computed(() => {
  if (!props.send.statistics.processed) {
    return '-';
  }

  return t('home.recent_sends.metrics.processed.value', {
    processed: props.send.statistics.processed.toLocaleString(),
    total: props.send.statistics.contactCount.toLocaleString(),
  });
});

const processedPercentage = computed(() => {
  return getPercentage(
    props.send.statistics.processed,
    props.send.statistics.contactCount,
  );
});

const estimatedCost = computed(() => {
  const currency = Currency[props.send.statistics.currency];
  const value = toLocalizedFloat(props.send.statistics.cost);
  return `${currency}${value}`;
});
</script>

<style scoped lang="scss">
.send-element {
  padding: $unnnic-spacing-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;

  &:deep(.unnnic-collapse__header) {
    padding: unset;
    margin-bottom: unset;
  }

  &__header {
    display: flex;
    gap: $unnnic-spacing-xs;
    align-items: center;
  }

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__date {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__tag {
    &--aux-green {
      background-color: $unnnic-color-aux-green-100;
    }

    &--aux-orange {
      background-color: $unnnic-color-aux-orange-100;
    }
  }

  &__content {
    display: flex;
    flex-direction: row;
    gap: $unnnic-spacing-sm;
  }

  &__info {
    flex: 1;
  }

  &__metrics {
    flex: 2;
  }
}
</style>
