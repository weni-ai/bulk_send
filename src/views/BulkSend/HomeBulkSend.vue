<template>
  <BulkSendHomeLayout class="home-bulk-send">
    <template #header>
      <HomeHeader />
    </template>
    <template #content>
      <section class="home-bulk-send__general-performance">
        <h2 class="home-bulk-send__general-performance-title">
          {{ $t('home.general_performance') }}
        </h2>
        <MetricsTable :data="generalPerformanceData" :maxColumns="3" />
      </section>

      <UnnnicDisclaimer class="home-bulk-send__mmlite-disclaimer" icon="alert-circle-1-1" scheme="neutral-dark"
        :text="$t('home.mmlite-disclaimer')" @click="handleMMLiteDisclaimerClick" />

      <BasicDivider />

      <section class="home-bulk-send__recent-sends">
        <h2 class="home-bulk-send__recent-sends__title">
          {{ $t('home.recent_sends') }}
        </h2>

        <MissingRecentSends v-if="!recentSendsData.length" class="home-bulk-send__recent-sends__missing-recent-sends"
          @start-new-send="handleStartNewSend" />
      </section>
    </template>
  </BulkSendHomeLayout>
</template>

<script setup lang="ts">
import BulkSendHomeLayout from '@/layouts/BulkSend/BulkSendHomeLayout.vue'
import HomeHeader from '@/components/HomeBulkSend/HomeHeader.vue'
import MetricsTable from '@/components/MetricsTable.vue'
import BasicDivider from '@/components/BasicDivider.vue'
import MissingRecentSends from '@/components/HomeBulkSend/MissingRecentSends.vue'

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
          console.log('View details')
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
]

const recentSendsData: unknown[] = []

const handleMMLiteDisclaimerClick = () => {
  console.log('handleMMLiteDisclaimerClick')
}

const handleStartNewSend = () => {
  // for now just add a mocked data to the recentSendsData
  recentSendsData.push({
    id: recentSendsData.length + 1,
    name: 'Send ' + (recentSendsData.length + 1),
    status: 'pending',
    createdAt: new Date(),
  })
}
</script>

<style lang="scss" scoped>
.home-bulk-send {
  display: flex;
  flex-direction: column;

  &__general-performance {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-md;

    &-title {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-lg;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  &__mmlite-disclaimer {
    margin-top: $unnnic-spacing-md;
    display: flex;
    flex-direction: row;

    :deep(.highlight) {
      text-decoration: underline;
      font-weight: $unnnic-font-weight-bold;
      cursor: pointer;
    }
  }

  &__recent-sends {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-md;
    height: 100%;

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-lg;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }

    &__missing-recent-sends {
      height: 100%;
    }
  }
}
</style>