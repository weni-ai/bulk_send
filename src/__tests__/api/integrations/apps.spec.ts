import { describe, it, expect, vi, beforeEach } from 'vitest';
import Apps from '@/api/resources/integrations/apps';
import requests from '@/api/resources/integrations/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/integrations/apps', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('listApps calls /my-apps/ with project uuid as param', async () => {
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('project-123');

    const httpGet = vi.fn().mockResolvedValue({ data: { results: [] } });
    vi.spyOn(requests as any, '$http', 'get').mockReturnValue({
      get: httpGet,
    } as any);

    const response = await Apps.listApps();

    expect(httpGet).toHaveBeenCalledWith('/api/v1/my-apps/', {
      params: { configured: true, project_uuid: 'project-123' },
    });
    expect(response).toEqual({ data: { results: [] } });
  });
});
