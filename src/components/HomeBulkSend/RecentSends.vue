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
        :loading="showLoading"
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
import {
  DEFAULT_DATE_RANGE_DAYS,
  PAGE_SIZE,
  POLLING_DELAY_MS,
} from '@/constants/recentSends';
import type { DateRange } from '@/types/recentSends';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { endOfDay, startOfDay } from 'date-fns';

const broadcastsStore = useBroadcastsStore();
const projectStore = useProjectStore();

const isSearching = ref(false);
const hasSend = ref(true);
const recentSendsData = computed(() => broadcastsStore.broadcastsStatistics);
const loadingRecentSends = computed(
  () => broadcastsStore.loadingBroadcastsStatistics,
);
const recentSendsPage = ref(1);
const recentSendsPageSize = PAGE_SIZE;
const recentSendsTotal = computed(
  () => broadcastsStore.broadcastsStatisticsCount,
);
const loadingHasBroadcastsStatistics = computed(
  () => broadcastsStore.loadingHasBroadcastsStatistics,
);
const search = ref('');
const dateRange = ref<DateRange>(
  createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS),
);
const showMissingRecentSends = computed(
  () =>
    !hasSend.value &&
    !recentSendsData.value.length &&
    !showLoading.value &&
    !isSearching.value,
);

const searchClearIcon = computed(() => {
  return search.value !== '' ? 'close' : undefined;
});

const showLoading = computed(() => {
  return loadingRecentSends.value || loadingHasBroadcastsStatistics.value;
});

// Snapshot of last seen statistics per broadcast id
const lastStatsById = ref<Record<number, string> | null>(null);

onBeforeMount(async () => {
  await checkIfHasSend();
  if (hasSend.value) {
    startPollingQueuedBroadcast(0, true);
  }
});

const startPollingQueuedBroadcast = (delay: number, loading: boolean) => {
  setTimeout(async () => {
    await fetchRecentSends(loading);
    const currentStats: Record<number, string> = {};
    for (const send of recentSendsData.value) {
      currentStats[send.id] = JSON.stringify(send.statistics);
    }

    // If this is the first snapshot, set it and schedule another poll to detect changes
    if (lastStatsById.value === null) {
      lastStatsById.value = currentStats;
      startPollingQueuedBroadcast(POLLING_DELAY_MS, false);
      return;
    }

    // Detect if any current send has statistics changed since last snapshot
    let hasChanged = false;
    for (const idStr of Object.keys(currentStats)) {
      const id = Number(idStr);
      const prev = lastStatsById.value[id];
      const curr = currentStats[id];
      if (prev === undefined || prev !== curr) {
        hasChanged = true;
        break;
      }
    }

    // Update snapshot
    lastStatsById.value = currentStats;

    if (hasChanged) {
      startPollingQueuedBroadcast(POLLING_DELAY_MS, false);
    }
  }, delay);
};

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

const checkIfHasSend = async () => {
  hasSend.value = await broadcastsStore.hasBroadcastsStatistics(
    projectStore.project.uuid,
  );
};

const fetchRecentSends = async (shouldLoad = true) => {
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

    await broadcastsStore.getBroadcastsStatistics(
      projectStore.project.uuid,
      params,
      shouldLoad,
    );
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
