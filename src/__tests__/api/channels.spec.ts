import { describe, it, expect, vi, beforeEach } from 'vitest';
import Channels from '@/api/resources/channels';
import requests from '@/api/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/channels', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('listChannels calls /channels-by-project with project uuid as param', async () => {
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('project-123');

    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { results: [] } });

    const response = await Channels.listChannels();

    expect(httpGet).toHaveBeenCalledWith(
      '/api/v2/internals/channels-by-project',
      { params: { project_uuid: 'project-123' } },
    );
    expect(response).toEqual({ data: { results: [] } });
  });
});
