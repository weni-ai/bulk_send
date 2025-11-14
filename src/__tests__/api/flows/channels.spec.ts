import { describe, it, expect, vi, beforeEach } from 'vitest';
import Channels from '@/api/resources/flows/channels';
import requests from '@/api/resources/flows/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/flows/channels', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('listChannels calls /channels-by-project with project uuid as param', async () => {
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('project-123');

    const httpGet = vi.fn().mockResolvedValue({ data: { results: [] } });
    vi.spyOn(requests as any, '$http', 'get').mockReturnValue({
      get: httpGet,
    } as any);

    const response = await Channels.listChannels();

    expect(httpGet).toHaveBeenCalledWith(
      '/api/v2/internals/channels-by-project',
      { params: { project_uuid: 'project-123' } },
    );
    expect(response).toEqual({ data: { results: [] } });
  });
});
