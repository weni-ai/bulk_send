<template>
  <BulkSendHomeLayout class="home-bulk-send">
    <template #header>
      <HomeHeader />
    </template>
    <template #content>
      <section class="home-bulk-send__first-section">
        <section class="home-bulk-send__general-performance">
          <h2 class="home-bulk-send__general-performance-title">
            {{ $t('home.general_performance') }}
          </h2>
          <MetricsTable
            :data="generalPerformanceData"
            :maxColumns="3"
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
import BulkSendHomeLayout from '@/layouts/BulkSend/BulkSendHomeLayout.vue';
import HomeHeader from '@/components/HomeBulkSend/HomeHeader.vue';
import MetricsTable from '@/components/MetricsTable.vue';
import RecentSends from '@/components/HomeBulkSend/RecentSends.vue';
import ActivateMMLiteModal from '@/components/modals/ActivateMMLite.vue';
import { useProjectStore } from '@/stores/project';
import type { Channel } from '@/types/channel';

const projectStore = useProjectStore();

const showMMLiteSection = computed(() => {
  if (projectStore.project.channels.length === 0) {
    return false;
  }

  const hasMMLiteChannel = projectStore.project.channels.some(
    (channel: Channel) => channel.MMLite,
  );

  const hasWhatsappChannel = projectStore.project.channels.some(
    (channel: Channel) => channel.channel_type === 'WAC',
  );

  return hasWhatsappChannel && !hasMMLiteChannel;
});

const showActivateMMLiteModal = ref(false);

const generalPerformanceData = [
  {
    label: 'Total sent',
    value: '124.580',
    hint: 'Total number of messages sent through bulk sends within the selected period.',
    actions: [
      {
        label: 'View details',
        icon: 'info',
        onClick: () => {
          console.log('View details');
        },
      },
    ],
  },
  {
    label: 'Estimated total cost',
    value: '$ 7.474,80',
    hint: 'Estimated cost based on the number of messages sent. Final pricing may vary according to Meta’s billing.',
  },
  {
    label: 'Success rate',
    value: '91%',
    hint: 'Percentage of contacts who successfully received messages, calculated from the total number of unique contacts targeted across all sends.',
  },
  {
    label: 'Total sent 2',
    value: '124.580',
    hint: 'Total number of messages sent through bulk sends within the selected period.',
  },
  {
    label: 'Estimated total cost 2',
    value: '$ 7.474,80',
    hint: 'Estimated cost based on the number of messages sent. Final pricing may vary according to Meta’s billing.',
  },
  {
    label: 'Success rate 2',
    value: '91%',
    hint: 'Percentage of contacts who successfully received messages, calculated from the total number of unique contacts targeted across all sends.',
  },
];

onBeforeMount(() => {
  projectStore.getProjectChannels();
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
</script>

<style lang="scss" scoped>
.home-bulk-send {
  display: flex;
  flex-direction: column;
  flex: 1;

  &__first-section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__general-performance {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    // margin-bottom: $unnnic-spacing-md;

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
      text-decoration: underline;
      font-weight: $unnnic-font-weight-bold;
      cursor: pointer;

      border: none;
      background: none;
      color: $unnnic-color-neutral-dark;
      padding: 0;
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
    }
  }
}
</style>
