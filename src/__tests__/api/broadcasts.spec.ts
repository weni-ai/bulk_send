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

  it('calls POST /whatsapp_broadcasts with template variables and optional attachment', async () => {
    const httpPost = (requests as any).$http.post as ReturnType<typeof vi.fn>;
    httpPost.mockResolvedValue({ data: { id: 99 } });

    const template = { uuid: 'tpl-1', channel: 'channel-1' } as any;
    const variables = ['@fields.name'];
    const groups = ['g1', 'g2'];

    // without attachment
    let result = await Broadcasts.createBroadcast(
      'My BC',
      template,
      variables,
      groups,
    );
    expect(httpPost).toHaveBeenCalledWith(
      '/api/v2/internals/whatsapp_broadcasts',
      expect.objectContaining({
        queue: 'template_batch',
        name: 'My BC',
        channel: 'channel-1',
        msg: { template: { uuid: 'tpl-1', variables } },
        groups,
      }),
    );
    expect(result).toEqual({ data: { id: 99 } });

    // with attachment
    httpPost.mockClear();
    result = await Broadcasts.createBroadcast(
      'My BC',
      template,
      variables,
      groups,
      { url: 'https://cdn/file.jpg', type: 'image' },
    );
    expect(httpPost).toHaveBeenCalledWith(
      '/api/v2/internals/whatsapp_broadcasts',
      expect.objectContaining({
        msg: {
          template: { uuid: 'tpl-1', variables },
          attachments: ['image:https://cdn/file.jpg'],
        },
      }),
    );
    expect(result).toEqual({ data: { id: 99 } });
  });

  it('calls POST /broadcasts/upload_media with FormData including project_uuid', async () => {
    const httpPost = (requests as any).$http.post as ReturnType<typeof vi.fn>;
    httpPost.mockResolvedValue({ data: { url: 'u', type: 'image' } });

    const file = new Blob(['x'], { type: 'image/jpeg' }) as unknown as File;
    const result = await Broadcasts.uploadMedia(file);

    expect(httpPost).toHaveBeenCalledWith(
      '/api/v2/internals/broadcasts/upload_media',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    expect(result).toEqual({ data: { url: 'u', type: 'image' } });
  });
});
