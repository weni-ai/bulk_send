import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useBroadcastsStore } from '@/stores/broadcasts';
import Broadcasts from '@/api/resources/broadcasts';
import type { AxiosResponse } from 'axios';
import type { BroadcastStatistic } from '@/types/broadcast';

// Mock API module used by the store
vi.mock('@/api/resources/broadcasts', () => ({
  default: {
    getBroadcastsStatistics: vi.fn(),
    getBroadcastsMonthPerformance: vi.fn(),
  },
}));

describe('broadcasts store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getBroadcastsStatistics loads, maps dates, stores data and toggles loading flag', async () => {
    const store = useBroadcastsStore();

    const raw: any = {
      id: 1,
      name: 'Test',
      status: 'S',
      createdBy: 'user',
      createdOn: '2024-01-01T00:00:00Z',
      modifiedOn: '2024-01-02T00:00:00Z',
      groups: [1],
      template: { name: 'T' },
      statistics: {
        processed: 1,
        sent: 1,
        delivered: 1,
        read: 1,
        failed: 0,
        contactCount: 1,
      },
    };

    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.getBroadcastsStatistics.mockResolvedValue({
      data: { count: 1, results: [raw] },
    } as AxiosResponse);

    expect(store.loadingBroadcastsStatistics).toBe(false);

    const promise = store.getBroadcastsStatistics('proj-123', {
      offset: 0,
      limit: 5,
    });
    expect(store.loadingBroadcastsStatistics).toBe(true);
    await promise;

    expect(mocked.getBroadcastsStatistics).toHaveBeenCalledWith('proj-123', {
      offset: 0,
      limit: 5,
    });
    expect(store.broadcastsStatisticsCount).toBe(1);
    expect(store.broadcastsStatistics).toHaveLength(1);
    const item = store.broadcastsStatistics[0] as BroadcastStatistic;
    expect(item.createdOn instanceof Date).toBe(true);
    expect(item.modifiedOn instanceof Date).toBe(true);
    expect(store.loadingBroadcastsStatistics).toBe(false);
  });

  it('getBroadcastsMonthPerformance loads and stores month stats, toggling loading flag', async () => {
    const store = useBroadcastsStore();

    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.getBroadcastsMonthPerformance.mockResolvedValue({
      data: {
        last30DaysStats: { totalSent: 42 },
        successRate: 0.77,
      },
    } as AxiosResponse);

    expect(store.loadingBroadcastsMonthPerformance).toBe(false);
    const promise = store.getBroadcastsMonthPerformance('proj-123');
    expect(store.loadingBroadcastsMonthPerformance).toBe(true);
    await promise;

    expect(mocked.getBroadcastsMonthPerformance).toHaveBeenCalledWith(
      'proj-123',
    );
    expect(store.broadcastMonthPerformance.totalSent).toBe(42);
    expect(store.broadcastMonthPerformance.successRate).toBe(0.77);
    // cost is a temporary constant in store for now
    expect(typeof store.broadcastMonthPerformance.estimatedCost).toBe('number');
    expect(store.loadingBroadcastsMonthPerformance).toBe(false);
  });
});
