<template>
  <section class="recent-sends">
    <h2 class="recent-sends__title">
      {{ $t('home.recent_sends.title') }}
    </h2>

    <MissingRecentSends v-if="!recentSendsData.length" class="recent-sends__missing-recent-sends"
      @start-new-send="handleStartNewSend" />

    <section v-else class="recent-sends__content">
      <section class="recent-sends__filters">
        <UnnnicInput class="recent-sends__search" icon-left="search-1"
          :placeholder="$t('home.recent_sends.search_placeholder')" :model-value="search"
          @update:model-value="handleSearchUpdate" />

        <UnnnicInputDatePicker class="recent-sends__date-range" :placeholder="$t('home.recent_sends.date_placeholder')"
          position="right" :model-value="dateRange" @update:model-value="handleDateRangeUpdate" />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MissingRecentSends from '@/components/HomeBulkSend/MissingRecentSends.vue'
import { createDateRangeFromDaysAgo } from '@/utils/date'
import { DEFAULT_DATE_RANGE_DAYS } from '@/constants/recentSends'
import type { RecentSend, DateRange } from '@/types/recentSends'

const recentSendsData = ref<RecentSend[]>([])
const search = ref('')
const dateRange = ref<DateRange>(createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS))

const handleSearchUpdate = (value: string) => {
  search.value = value
}

const handleDateRangeUpdate = (value: DateRange) => {
  dateRange.value = value
}

const handleStartNewSend = () => {
  // For now just add mocked data to the recentSendsData
  const newSends = Array.from({ length: 10 }, (_, index) => ({
    id: recentSendsData.value.length + index + 1,
    name: `Send ${recentSendsData.value.length + index + 1}`,
    status: 'pending',
    createdAt: new Date(),
    endedAt: new Date(),
    template: {
      name: `Template ${recentSendsData.value.length + index + 1}`,
    },
    groups: ['Group 1', 'Group 2'],
    createdBy: 'john.doe@email.com',
    metrics: {
      sent: 100000,
      delivered: 90500,
      read: 80000,
      clicked: 20000,
      failed: 1500,
      estimatedCost: "R$ 25.000,00",
    },
  }))

  recentSendsData.value.push(...newSends)
}
</script>

<style lang="scss" scoped>
.recent-sends {
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

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-md;
    height: 100%;
  }

  &__filters {
    display: flex;
    gap: $unnnic-spacing-sm;
  }

  &__search {
    flex: 5;
  }

  &__date-range {
    flex: 1;

    :deep(.unnnic-form) {
      width: 100%;
    }
  }

}
</style>