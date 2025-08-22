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

  it('calls POST /contact_groups with project uuid and mapped status', async () => {
    const httpPost = (requests as any).$http.post as ReturnType<typeof vi.fn>;
    httpPost.mockResolvedValue({ data: { id: 1 } });

    const projectUuid = 'proj-123';
    const groupName = 'Failed - Promo';
    const broadcastID = 42;
    const statusKey = 'failed';

    const result = await Broadcasts.createGroupFromStatus(
      projectUuid,
      groupName,
      broadcastID,
      statusKey as any,
    );

    expect(httpPost).toHaveBeenCalledWith(
      `/api/v2/internals/contact_groups?project_uuid=${projectUuid}`,
      {
        broadcast_id: broadcastID,
        name: groupName,
        status: 'F',
      },
    );
    expect(result).toEqual({ data: { id: 1 } });
  });
});
