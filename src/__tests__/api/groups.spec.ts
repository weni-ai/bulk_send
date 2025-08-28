import { describe, it, expect, vi } from 'vitest';
import Groups from '@/api/resources/groups';
import requests from '@/api/requests';

describe('api/resources/groups', () => {
  it('getGroups calls endpoint with merged params including project uuid', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { count: 0, results: [] } });

    const params = { limit: 9, offset: 0, name: 'A', order: 'name' };
    const response = await Groups.getGroups('project-123', params as any);

    expect(httpGet).toHaveBeenCalledWith('/api/v2/internals/contact_groups', {
      params: { ...params, project_uuid: 'project-123' },
    });
    expect(response).toEqual({ data: { count: 0, results: [] } });
  });
});
