import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Projects from '@/api/resources/flows/projects';
import requests from '@/api/resources/flows/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/flows/projects', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('proj-abc');
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getProjectInfo calls /api/v2/projects with project_uuid', async () => {
    const httpGet = vi.fn().mockResolvedValue({ data: { brain_on: false } });
    vi.spyOn(requests as any, '$http', 'get').mockReturnValue({
      get: httpGet,
    } as any);

    const res = await Projects.getProjectInfo();
    expect(httpGet).toHaveBeenCalledWith('/api/v2/projects', {
      params: { project_uuid: 'proj-abc' },
    });
    expect(res).toEqual({ data: { brain_on: false } });
  });
});
