<template>
  <UnnnicCollapse class="send-element">
    <template #header>
      <header class="send-element__header">
        <h2 class="send-element__title">
          {{ send.name }}
        </h2>
        <p class="send-element__date">
          {{ date }}
        </p>
        <UnnnicTag
          :class="`send-element__tag send-element__tag--${tagScheme}`"
          :text="send.status"
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
      :contactCount="send.metrics.sent.toLocaleString()"
      :category="modalCategory"
      :broadcastName="modalBroadcastName"
      @update:model-value="handleUpdateShowNewGroupModal"
    />
  </UnnnicCollapse>
</template>

<script setup lang="ts">
import MetricsTable from '@/components/MetricsTable.vue';
import SendElementInfo from '@/components/HomeBulkSend/SendElementInfo.vue';
import NewContactGroupModal from '@/components/modals/NewContactGroup.vue';
import type { RecentSend } from '@/types/recentSends';
import { formatDateWithTimezone } from '@/utils/date';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
  send: RecentSend;
}>();

const tagScheme = computed(() => {
  if (props.send.status.toLowerCase() === 'finished') {
    return 'aux-green';
  }
  return 'aux-orange';
});

const date = computed(() => {
  return formatDateWithTimezone(props.send.createdAt, 'dd/MM/yyyy');
});

const showNewGroupModal = ref(false);
const modalCategory = ref('');
const modalBroadcastName = ref('');

const displayNewGroupModal = (category: string, broadcastName: string) => {
  modalCategory.value = category;
  modalBroadcastName.value = broadcastName;
  showNewGroupModal.value = true;
};

const handleUpdateShowNewGroupModal = (value: boolean) => {
  showNewGroupModal.value = value;
};

const sendMetrics = computed(() => {
  // TODO: update hints when design is ready
  return [
    {
      label: t('home.recent_sends.metrics.sent.label'),
      value: props.send.metrics.sent?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.sent.hint'),
    },
    {
      label: t('home.recent_sends.metrics.delivered.label'),
      value: deliveredPercentage.value,
      subValue: props.send.metrics.delivered?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.delivered.hint'),
    },
    {
      label: t('home.recent_sends.metrics.estimated_cost.label'),
      value: props.send.metrics.estimatedCost.toString(), // TODO: change to currency when API is ready
      hint: t('home.recent_sends.metrics.estimated_cost.hint'),
    },
    {
      label: t('home.recent_sends.metrics.read.label'),
      value: readPercentage.value,
      subValue: props.send.metrics.read?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.read.hint'),
    },
    {
      label: t('home.recent_sends.metrics.clicked.label'),
      value: clickedPercentage.value,
      subValue: props.send.metrics.clicked?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.clicked.hint'),
      actions: [
        {
          label: t('home.recent_sends.metrics.actions.add_to_a_new_group'),
          icon: 'add',
          onClick: () => {
            displayNewGroupModal(
              t('home.recent_sends.metrics.clicked.category'),
              props.send.name,
            );
          },
        },
      ],
    },
    {
      label: t('home.recent_sends.metrics.failed.label'),
      value: failedPercentage.value,
      subValue: props.send.metrics.failed?.toLocaleString() || '-',
      hint: t('home.recent_sends.metrics.failed.hint'),
      actions: [
        {
          label: t('home.recent_sends.metrics.actions.add_to_a_new_group'),
          icon: 'add',
          onClick: () => {
            displayNewGroupModal(
              t('home.recent_sends.metrics.failed.category'),
              props.send.name,
            );
          },
        },
      ],
    },
  ];
});

const getPercentage = (value: number, total: number) => {
  if (!value || !total) {
    return '-';
  }
  return `${((value / total) * 100).toLocaleString()}%`;
};

const deliveredPercentage = computed(() => {
  return getPercentage(props.send.metrics.delivered, props.send.metrics.sent);
});

const readPercentage = computed(() => {
  return getPercentage(props.send.metrics.read, props.send.metrics.sent);
});

const clickedPercentage = computed(() => {
  return getPercentage(props.send.metrics.clicked, props.send.metrics.sent);
});

const failedPercentage = computed(() => {
  return getPercentage(props.send.metrics.failed, props.send.metrics.sent);
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
