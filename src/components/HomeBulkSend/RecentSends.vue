<template>
  <section
    class="recent-sends"
    data-test="recent-sends"
  >
    <h2
      class="recent-sends__title"
      data-test="title"
    >
      {{ $t('home.recent_sends.title') }}
    </h2>

    <MissingRecentSends
      v-if="showMissingRecentSends"
      class="recent-sends__missing-recent-sends"
      @start-new-send="handleStartNewSend"
    />

    <section
      v-else
      class="recent-sends__content"
      data-test="content"
    >
      <section
        class="recent-sends__filters"
        data-test="filters"
      >
        <UnnnicInput
          class="recent-sends__search"
          data-test="search-input"
          iconLeft="search-1"
          :placeholder="$t('home.recent_sends.search_placeholder')"
          :modelValue="search"
          :iconRight="searchClearIcon"
          iconRightClickable
          @icon-right-click="handleSearchClear"
          @update:model-value="handleSearchUpdate"
        />

        <UnnnicInputDatePicker
          class="recent-sends__date-range"
          data-test="date-range"
          :placeholder="$t('home.recent_sends.date_placeholder')"
          position="right"
          :modelValue="dateRange"
          @update:model-value="handleDateRangeUpdate"
        />
      </section>

      <RecentSendsList
        :loading="loadingRecentSends"
        :recentSends="recentSendsData"
        :page="recentSendsPage"
        :pageSize="recentSendsPageSize"
        :total="recentSendsTotal"
        @update:page="handlePageUpdate"
        @reset="handleReset"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import MissingRecentSends from '@/components/HomeBulkSend/MissingRecentSends.vue';
import RecentSendsList from '@/components/HomeBulkSend/RecentSendsList.vue';
import { createDateRangeFromDaysAgo, getDateInUTC } from '@/utils/date';
import { DEFAULT_DATE_RANGE_DAYS, PAGE_SIZE } from '@/constants/recentSends';
import type { DateRange } from '@/types/recentSends';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { endOfDay, startOfDay } from 'date-fns';

const broadcastsStore = useBroadcastsStore();
const projectStore = useProjectStore();

const isSearching = ref(false);
const recentSendsData = computed(() => broadcastsStore.broadcastsStatistics);
const loadingRecentSends = computed(
  () => broadcastsStore.loadingBroadcastsStatistics,
);
const recentSendsPage = ref(1);
const recentSendsPageSize = PAGE_SIZE;
const recentSendsTotal = computed(
  () => broadcastsStore.broadcastsStatisticsCount,
);
const search = ref('');
const dateRange = ref<DateRange>(
  createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS),
);
const showMissingRecentSends = computed(
  () =>
    !recentSendsData.value.length &&
    !loadingRecentSends.value &&
    !isSearching.value,
);

const searchClearIcon = computed(() => {
  return search.value !== '' ? 'close' : undefined;
});

onBeforeMount(() => {
  fetchRecentSends();
});

const handleSearchUpdate = useDebounceFn((value: string) => {
  search.value = value;
  isSearching.value = true;
  handlePageUpdate(1);
}, 500);

const handleDateRangeUpdate = useDebounceFn((value: DateRange) => {
  dateRange.value = value;
  handlePageUpdate(1);
}, 500);

const handleSearchClear = () => {
  search.value = '';
  isSearching.value = false;
};

const handleReset = () => {
  search.value = '';
  dateRange.value = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
  handlePageUpdate(1);
};

const handleStartNewSend = () => {
  // TODO: implement redirect to new send page
  console.log('handleStartNewSend');
};

const fetchRecentSends = async () => {
  const startDate = getDateInUTC(new Date(dateRange.value.start));
  const endDate = getDateInUTC(new Date(dateRange.value.end));
  try {
    const params = {
      offset: (recentSendsPage.value - 1) * recentSendsPageSize,
      limit: recentSendsPageSize,
      start_date: startOfDay(startDate).toISOString(),
      end_date: endOfDay(endDate).toISOString(),
      name: search.value.trim(),
    };

    broadcastsStore.getBroadcastsStatistics(projectStore.project.uuid, params);
  } catch (error) {
    console.error(error); // TODO: check with design if we need to show an error message to the user
  }
};

const handlePageUpdate = (page: number) => {
  recentSendsPage.value = page;
  fetchRecentSends();
};
</script>

<style lang="scss" scoped>
.recent-sends {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  flex: 1;

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
    gap: $unnnic-spacing-sm;
    height: 100%;
  }

  &__filters {
    display: flex;
    gap: $unnnic-spacing-sm;
  }

  &__search {
    flex: 3;
  }

  &__date-range {
    flex: 1;

    :deep(.unnnic-form) {
      width: 100%;
    }
  }
}
</style>
