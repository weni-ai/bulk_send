<template>
  <section class="recent-sends">
    <h2 class="recent-sends__title">
      {{ $t('home.recent_sends') }}
    </h2>

    <MissingRecentSends v-if="!recentSendsData.length" class="recent-sends__missing-recent-sends"
      @start-new-send="handleStartNewSend" />

    <section v-else class="recent-sends__content">
      <section class="recent-sends__content__filters">
        <UnnnicInput class="recent-sends__content__filters__search" icon-left="search-1"
          :placeholder="$t('home.recent_sends.search_placeholder')" :model-value="search"
          @update:model-value="handleSearchUpdate" />

        <UnnnicInputDatePicker class="recent-sends__content__filters__date-range"
          :placeholder="$t('home.recent_sends.date_placeholder')" :model-value="dateRange"
          @update:model-value="handleDateRangeUpdate" />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import MissingRecentSends from '@/components/HomeBulkSend/MissingRecentSends.vue'
import { ref, reactive } from 'vue'

interface DateRange {
  start: string
  end: string
}

const formatDateWithTimezone = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const tzDate = new Date(date.getTime() - (offset * 60 * 1000))
  return tzDate.toISOString().split('T')[0]
}

const recentSendsData = reactive<unknown[]>([])
const search = ref('')
const dateRange = ref<DateRange>({
  start: formatDateWithTimezone(new Date(new Date().setDate(new Date().getDate() - 30))),
  end: formatDateWithTimezone(new Date()),
})

const handleSearchUpdate = (value: string) => {
  search.value = value
}

const handleDateRangeUpdate = (value: DateRange) => {
  dateRange.value = value
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

    &__filters {
      display: flex;
      gap: $unnnic-spacing-sm;

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
  }
}
</style>