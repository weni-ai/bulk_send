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
import { nextTick } from 'vue';

// Inline helper and stubs
const TEST_DATE_RANGE = { start: '2024-01-01', end: '2024-01-31' };
const SELECTOR = {
  root: '[data-test="recent-sends"]',
  title: '[data-test="title"]',
  content: '[data-test="content"]',
  missing: '[data-test="missing-recent-sends"]',
  search: 'input[data-test="search-input"]',
  clear: '[data-test="search-input-clear"]',
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
    emits: ['update:page', 'reset'],
    template:
      '<div data-test="recent-sends-list">RecentSendsList - {{ recentSends.length }}</div>',
  },
  UnnnicInput: {
    name: 'UnnnicInput',
    props: [
      'placeholder',
      'modelValue',
      'iconLeft',
      'iconRight',
      'iconRightClickable',
    ],
    emits: ['update:model-value', 'icon-right-click'],
    template:
      '<div>' +
      '<input data-test="search-input" :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />' +
      '<button v-if="modelValue && modelValue.length > 0" data-test="search-input-clear" @click="$emit(\'icon-right-click\')">x</button>' +
      '</div>',
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

  it('suppresses empty state while searching', async () => {
    vi.useFakeTimers();
    const { wrapper, broadcastsStore } = mountRecentSends({
      spy: true,
      broadcasts: { loading: true },
    });
    const searchInput = wrapper.find(SELECTOR.search);

    await searchInput.setValue('hello');
    await searchInput.trigger('input');
    await vi.advanceTimersByTimeAsync(500);

    // Simulate request completed, but still searching; empty state should remain hidden
    broadcastsStore.loadingBroadcastsStatistics = false;
    await nextTick();

    expect(wrapper.find(SELECTOR.missing).exists()).toBe(false);
    expect(wrapper.find(SELECTOR.content).exists()).toBe(true);
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

  it('resets to page 1 on search from a later page', async () => {
    vi.useFakeTimers();
    const { wrapper, spy } = mountRecentSends({
      spy: true,
      broadcasts: { statistics: [createBroadcast()], count: 20 },
    });
    // Go to page 3
    const list = wrapper.findComponent({ name: 'RecentSendsList' });
    list.vm.$emit('update:page', 3);
    expect(spy).toHaveBeenCalledTimes(2);

    // Type a search which should reset page to 1
    const searchInput = wrapper.find(SELECTOR.search);
    await searchInput.setValue('abc');
    await searchInput.trigger('input');
    await vi.advanceTimersByTimeAsync(500);

    const defaultRange = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
    const { start: expectedStart, end: expectedEnd } = mkIsoRange(defaultRange);

    // Third call uses offset 0 (page 1)
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenLastCalledWith(DEFAULT_PROJECT_UUID, {
      offset: 0,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: 'abc',
    });
  });

  it('shows clear icon only when there is search text', async () => {
    vi.useFakeTimers();
    const { wrapper } = mountRecentSends({ broadcasts: { loading: true } });

    // Initially no search text -> clear icon hidden
    expect(wrapper.find(SELECTOR.clear).exists()).toBe(false);

    // Type something -> clear icon appears after debounce set value
    const searchInput = wrapper.find(SELECTOR.search);
    await searchInput.setValue('a');
    await searchInput.trigger('input');
    await vi.advanceTimersByTimeAsync(500);
    await nextTick();
    expect(wrapper.find(SELECTOR.clear).exists()).toBe(true);

    // Clear model by typing empty -> clear icon hides again
    await searchInput.setValue('');
    await searchInput.trigger('input');
    await vi.advanceTimersByTimeAsync(500);
    await nextTick();
    expect(wrapper.find(SELECTOR.clear).exists()).toBe(false);
  });

  it('clicking clear resets search, hides empty state suppression, and avoids redundant fetch', async () => {
    vi.useFakeTimers();
    const { wrapper, spy, broadcastsStore } = mountRecentSends({
      spy: true,
      broadcasts: { loading: true },
    });

    // Start typing to show clear icon and create searching state
    const searchInput = wrapper.find(SELECTOR.search);
    await searchInput.setValue('hello');
    await searchInput.trigger('input');
    await vi.advanceTimersByTimeAsync(500);
    await nextTick();
    expect(wrapper.find(SELECTOR.clear).exists()).toBe(true);

    const initialCalls = spy ? spy.mock.calls.length : 0;

    // Click clear
    await wrapper.find(SELECTOR.clear).trigger('click');
    await nextTick();

    // After clearing, input becomes empty and clear icon disappears
    const inputEl = wrapper.find(SELECTOR.search).element as HTMLInputElement;
    expect(inputEl.value).toBe('');
    expect(wrapper.find(SELECTOR.clear).exists()).toBe(false);

    // Should not trigger an immediate extra fetch beyond the debounce-driven last one
    const afterClearCalls = spy ? spy.mock.calls.length : 0;
    expect(afterClearCalls).toBe(initialCalls);

    // Also, with loading false and empty results, empty state can be shown again
    broadcastsStore.loadingBroadcastsStatistics = false;
    await nextTick();
    expect(wrapper.find(SELECTOR.missing).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.content).exists()).toBe(false);
  });

  it('resets all filters when reset is received from the list', async () => {
    vi.useFakeTimers();
    const { wrapper, spy } = mountRecentSends({
      spy: true,
      broadcasts: { loading: true },
    });
    const defaultRange = createDateRangeFromDaysAgo(DEFAULT_DATE_RANGE_DAYS);
    const { start: expectedStart, end: expectedEnd } = mkIsoRange(defaultRange);

    const list = wrapper.findComponent({ name: 'RecentSendsList' });
    list.vm.$emit('reset');
    await vi.advanceTimersByTimeAsync(500);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(DEFAULT_PROJECT_UUID, {
      offset: 0,
      limit: PAGE_SIZE,
      start_date: expectedStart,
      end_date: expectedEnd,
      name: '',
    });
  });
});
