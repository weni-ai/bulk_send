import { describe, it, expect, vi, afterEach } from 'vitest';
import { PAGE_SIZE, DEFAULT_DATE_RANGE_DAYS } from '@/constants/recentSends';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RecentSends from '@/components/HomeBulkSend/RecentSends.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { createBroadcast } from '@/__tests__/utils/factories';
import type { BroadcastStatistic } from '@/types/broadcast';
import { startOfDay, endOfDay } from 'date-fns';
import { createDateRangeFromDaysAgo, getDateInUTC } from '@/utils/date';
import type { DateRange } from '@/types/recentSends';
import { DEFAULT_PROJECT_UUID } from '@/__tests__/utils/constants';

// Inline helper and stubs
const TEST_DATE_RANGE = { start: '2024-01-01', end: '2024-01-31' };
const SELECTOR = {
  root: '[data-test="recent-sends"]',
  title: '[data-test="title"]',
  content: '[data-test="content"]',
  missing: '[data-test="missing-recent-sends"]',
  search: '[data-test="search-input"]',
  date: '[data-test="date-range"]',
  list: '[data-test="recent-sends-list"]',
};
const $t = (key: string) => key;

// Helper to build ISO start/end from any DateRange (mirrors component logic)
const mkIsoRange = (range: DateRange) => {
  const startDate = getDateInUTC(new Date(range.start));
  const endDate = getDateInUTC(new Date(range.end));
  return {
    start: startOfDay(startDate).toISOString(),
    end: endOfDay(endDate).toISOString(),
  };
};

const stubs = {
  MissingRecentSends: {
    emits: ['start-new-send'],
    template:
      '<div data-test="missing-recent-sends" @click="$emit(\'start-new-send\')">Missing Recent Sends</div>',
  },
  RecentSendsList: {
    name: 'RecentSendsList',
    props: ['loading', 'recentSends', 'page', 'pageSize', 'total'],
    emits: ['update:page'],
    template:
      '<div data-test="recent-sends-list">RecentSendsList - {{ recentSends.length }}</div>',
  },
  UnnnicInput: {
    name: 'UnnnicInput',
    props: ['placeholder', 'modelValue', 'iconLeft'],
    emits: ['update:model-value'],
    template:
      '<input data-test="search-input" :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
  },
  UnnnicInputDatePicker: {
    name: 'UnnnicInputDatePicker',
    props: ['placeholder', 'modelValue'],
    emits: ['update:model-value'],
    template:
      '<input data-test="date-range" :placeholder="placeholder" @change="$emit(\'update:model-value\', { start: \'2024-01-01\', end: \'2024-01-31\' })" />',
  },
};

type MountOptions = {
  props?: Record<string, unknown>;
  projectUuid?: string;
  broadcasts?: {
    loading?: boolean;
    statistics?: BroadcastStatistic[];
    count?: number;
  };
  spy?: boolean;
};

const mountRecentSends = (options: MountOptions = {}) => {
  const pinia = createPinia();
  setActivePinia(pinia);

  const {
    props = {},
    projectUuid = DEFAULT_PROJECT_UUID,
    broadcasts = {},
    spy: shouldSpy = true,
  } = options;
  const { loading = false, statistics, count = 0 } = broadcasts;

  const projectStore = useProjectStore(pinia);
  projectStore.project.uuid = projectUuid;

  const broadcastsStore = useBroadcastsStore(pinia);
  broadcastsStore.loadingBroadcastsStatistics = loading;
  broadcastsStore.broadcastsStatistics = statistics ?? [];
  broadcastsStore.broadcastsStatisticsCount = count;

  const spy = shouldSpy
    ? vi.spyOn(broadcastsStore, 'getBroadcastsStatistics')
    : undefined;
  if (spy) spy.mockResolvedValue();

  const wrapper = mount(RecentSends, {
    props,
    global: {
      plugins: [pinia],
      mocks: { $t },
      stubs,
    },
  });

  return { wrapper, pinia, projectStore, broadcastsStore, spy };
};

describe('RecentSends.vue', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders core UI elements', () => {
    const { wrapper } = mountRecentSends();

    expect(wrapper.find(SELECTOR.root).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.title).exists()).toBe(true);
  });

  it('shows empty state when there is no data', () => {
    const { wrapper } = mountRecentSends();

    expect(wrapper.find(SELECTOR.missing).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.content).exists()).toBe(false);
  });

  it('fetches on mount with default page, date range and empty search', () => {
    const { spy } = mountRecentSends({ spy: true });
    expect(spy).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);

    const defaultRange = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
    const { start: expectedStart, end: expectedEnd } = mkIsoRange(defaultRange);

    expect(spy).toHaveBeenCalledWith(DEFAULT_PROJECT_UUID, {
      offset: 0,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: '',
    });
  });

  it('propagates loading state to the list', () => {
    const { wrapper } = mountRecentSends({ broadcasts: { loading: true } });
    expect(wrapper.find(SELECTOR.content).exists()).toBe(true);
    const list = wrapper.findComponent({ name: 'RecentSendsList' });
    expect(list.exists()).toBe(true);
    expect(list.props('loading')).toBe(true);
  });

  it('debounces search updates and calls API with trimmed name', async () => {
    vi.useFakeTimers();
    const { wrapper, spy } = mountRecentSends({
      spy: true,
      broadcasts: { loading: true },
    });
    const searchInput = wrapper.find(SELECTOR.search);

    await searchInput.setValue('  test search  ');
    await searchInput.trigger('input');

    await vi.advanceTimersByTimeAsync(500);

    const defaultRange = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
    const { start: expectedStart, end: expectedEnd } = mkIsoRange(defaultRange);

    expect(spy).toHaveBeenLastCalledWith(DEFAULT_PROJECT_UUID, {
      offset: 0,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: 'test search',
    });
  });

  it('debounces date range changes and calls API with new start/end dates', async () => {
    vi.useFakeTimers();
    const { wrapper, spy } = mountRecentSends({
      spy: true,
      broadcasts: { loading: true },
    });
    const datePicker = wrapper.find(SELECTOR.date);

    await datePicker.trigger('change');

    await vi.advanceTimersByTimeAsync(500);

    const { start: expectedStart, end: expectedEnd } =
      mkIsoRange(TEST_DATE_RANGE);

    expect(spy).toHaveBeenLastCalledWith(DEFAULT_PROJECT_UUID, {
      offset: 0,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: '',
    });
  });

  it('displays list when data exists', async () => {
    const { wrapper } = mountRecentSends({
      broadcasts: { statistics: [createBroadcast()], count: 1 },
    });
    expect(wrapper.find(SELECTOR.list).exists()).toBe(true);
  });

  it('paginates and fetches the next page', async () => {
    const { wrapper, spy } = mountRecentSends({
      broadcasts: { statistics: [createBroadcast()], count: 10 },
      spy: true,
    });
    expect(spy).toBeDefined();
    // First call on mount
    expect(spy).toHaveBeenCalledTimes(1);
    // Emit pagination update from the list
    const list = wrapper.findComponent({ name: 'RecentSendsList' });
    list.vm.$emit('update:page', 2);
    // Second call with updated offset
    expect(spy).toHaveBeenCalledTimes(2);
    const defaultRange = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
    const { start: expectedStart, end: expectedEnd } = mkIsoRange(defaultRange);
    expect(spy).toHaveBeenLastCalledWith(DEFAULT_PROJECT_UUID, {
      offset: (2 - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: '',
    });
  });

  it('collapses rapid search typing into a single debounced API call', async () => {
    vi.useFakeTimers();
    const { wrapper, spy } = mountRecentSends({
      spy: true,
      broadcasts: { loading: true },
    });
    const searchInput = wrapper.find(SELECTOR.search);

    await searchInput.setValue('t');
    await searchInput.trigger('input');
    await searchInput.setValue('te');
    await searchInput.trigger('input');
    await searchInput.setValue('tes');
    await searchInput.trigger('input');
    await searchInput.setValue('test');
    await searchInput.trigger('input');

    await vi.advanceTimersByTimeAsync(500);

    const defaultRange = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
    const { start: expectedStart, end: expectedEnd } = mkIsoRange(defaultRange);

    // 1 initial call + 1 debounced call
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(DEFAULT_PROJECT_UUID, {
      offset: 0,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: 'test',
    });
  });
});
