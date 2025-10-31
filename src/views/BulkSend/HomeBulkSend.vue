<template>
  <BulkSendHomeLayout class="home-bulk-send">
    <template #header>
      <HomeHeader />
    </template>
    <template #content>
      <section class="home-bulk-send__first-section">
        <section class="home-bulk-send__general-performance">
          <h2 class="home-bulk-send__general-performance-title">
            {{ $t('home.general_performance.title') }}
          </h2>
          <MetricsTable
            v-if="!broadcastsStore.loadingBroadcastsMonthPerformance"
            :data="generalPerformanceData"
            :maxColumns="3"
          />
          <UnnnicSkeletonLoading
            v-else
            width="100%"
            height="112px"
            tag="div"
            :loading="true"
          />
        </section>

        <section
          v-if="showMMLiteSection"
          class="home-bulk-send__mmlite"
        >
          <UnnnicDisclaimer
            class="home-bulk-send__mmlite-disclaimer"
            icon="alert-circle-1-1"
            scheme="neutral-dark"
            :text="$t('home.mmlite_disclaimer')"
            @click="(event: Event) => handleMMLiteDisclaimerClick(event)"
          />
          <ActivateMMLiteModal
            v-if="showActivateMMLiteModal"
            :modelValue="showActivateMMLiteModal"
            @update:model-value="handleUpdateShowActivateMMLiteModal"
          />
        </section>
      </section>
      <RecentSends class="home-bulk-send__recent-sends" />
    </template>
  </BulkSendHomeLayout>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useTemplatesStore } from '@/stores/templates';
import type { Channel } from '@/types/channel';
import { useI18n } from 'vue-i18n';
import { toLocalizedFloat, toPercentage } from '@/utils/number';
import { Currency } from '@/constants/currency';

const { t } = useI18n();

const projectStore = useProjectStore();
const broadcastsStore = useBroadcastsStore();
const templateStore = useTemplatesStore();

const showMMLiteSection = computed(() => {
  if (projectStore.project.channels.length === 0) {
    return false;
  }

  const hasMMLiteChannel = projectStore.project.channels.some(
    (channel: Channel) => channel.MMLite,
  );

  const hasWhatsappChannel = projectStore.project.channels.some(
    (channel: Channel) => channel.channelType === 'WAC',
  );

  return hasWhatsappChannel && !hasMMLiteChannel;
});

const showActivateMMLiteModal = ref(false);

const formattedSuccessRate = computed(() => {
  return toPercentage(broadcastsStore.broadcastMonthPerformance.successRate);
});

const formattedEstimatedCost = computed(() => {
  const cost =
    templateStore.templatePricing.rates.marketing *
    broadcastsStore.broadcastMonthPerformance.totalSent;
  const currency = Currency[templateStore.templatePricing.currency];

  return `${currency}${toLocalizedFloat(cost)}`;
});

const generalPerformanceData = computed(() => [
  {
    label: t('home.general_performance.total_sent.label'),
    value: broadcastsStore.broadcastMonthPerformance.totalSent,
    hint: t('home.general_performance.total_sent.hint'),
  },
  {
    label: t('home.general_performance.estimated_total_cost.label'),
    value: formattedEstimatedCost.value,
    hint: t('home.general_performance.estimated_total_cost.hint'),
  },
  {
    label: t('home.general_performance.success_rate.label'),
    value: formattedSuccessRate.value,
    hint: t('home.general_performance.success_rate.hint'),
  },
]);

onBeforeMount(() => {
  fetchProjectChannels();
  fetchBroadcastsMonthPerformance();
});

const handleMMLiteDisclaimerClick = (event: Event) => {
  // Only show the modal if the user clicks on the show more button inside the disclaimer
  const target = event.target as HTMLElement;
  if (target.closest('button')) {
    showActivateMMLiteModal.value = true;
  }
};

const handleUpdateShowActivateMMLiteModal = (value: boolean) => {
  showActivateMMLiteModal.value = value;
};

const fetchProjectChannels = async () => {
  try {
    await projectStore.getProjectChannels();
  } catch (error) {
    console.error(error); // TODO: check with design if we need to show an error message to the user
  }
};

const fetchBroadcastsMonthPerformance = async () => {
  try {
    await templateStore.getTemplatePricing();
    await broadcastsStore.getBroadcastsMonthPerformance(
      projectStore.project.uuid,
    );
  } catch (error) {
    console.error(error); // TODO: check with design if we need to show an error message to the user
  }
};
</script>

<style lang="scss" scoped>
.home-bulk-send {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;

  &__first-section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__general-performance {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;

    &-title {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-lg;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  &__mmlite-disclaimer {
    display: flex;
    flex-direction: row;
    font-size: $unnnic-font-size-body-sm;
    line-height: $unnnic-font-size-body-sm + $unnnic-line-height-md;

    :deep(.highlight) {
      @include disclaimer-highlight;
    }
  }

  &__recent-sends {
    &::before {
      content: '';
      display: block;
      width: 100%;
      height: $unnnic-border-width-thinner;
      background-color: $unnnic-color-neutral-soft;
      margin-top: $unnnic-spacing-md;
      margin-bottom: $unnnic-spacing-xs;
    }
  }
}
</style>
