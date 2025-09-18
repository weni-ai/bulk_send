import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Projects from '@/api/resources/projects';
import requests from '@/api/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/projects', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('proj-abc');
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getProjectInfo calls /api/v2/projects with project_uuid', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { brain_on: false } });

    const res = await Projects.getProjectInfo();
    expect(httpGet).toHaveBeenCalledWith('/api/v2/projects', {
      params: { project_uuid: 'proj-abc' },
    });
    expect(res).toEqual({ data: { brain_on: false } });
  });
});
