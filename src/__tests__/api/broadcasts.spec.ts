import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Broadcasts from '@/api/resources/broadcasts';
import requests from '@/api/requests';
import { createPinia, setActivePinia } from 'pinia';

describe('api/resources/broadcasts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /broadcasts-statistics with project uuid and params', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { count: 1, results: [] } });

    const projectUuid = 'proj-123';
    const params = { offset: 5, limit: 10 } as any;

    const result = await Broadcasts.getBroadcastsStatistics(
      projectUuid,
      params,
    );

    expect(httpGet).toHaveBeenCalledWith(
      '/api/v2/internals/broadcasts-statistics',
      { params: { project_uuid: projectUuid, ...params } },
    );
    expect(result).toEqual({ data: { count: 1, results: [] } });
  });

  it('calls GET /broadcasts-statistics-stats with project uuid', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({
      data: { last30DaysStats: {}, successRate: 0 },
    });

    const projectUuid = 'proj-xyz';
    const result = await Broadcasts.getBroadcastsMonthPerformance(projectUuid);

    expect(httpGet).toHaveBeenCalledWith(
      '/api/v2/internals/broadcasts-statistics-stats',
      { params: { project_uuid: projectUuid } },
    );
    expect(result).toEqual({
      data: { last30DaysStats: {}, successRate: 0 },
    });
  });
});
