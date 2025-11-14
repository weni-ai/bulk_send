import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Flows from '@/api/resources/flows/flows';
import requests from '@/api/resources/flows/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/flows/flows', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('proj-abc');
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getFlows calls endpoint with project uuid', async () => {
    const httpGet = vi.fn().mockResolvedValue({ data: { results: [] } });
    vi.spyOn(requests as any, '$http', 'get').mockReturnValue({
      get: httpGet,
    } as any);

    const res = await Flows.getFlows();
    expect(httpGet).toHaveBeenCalledWith('/api/v2/internal_flows', {
      params: { project_uuid: 'proj-abc' },
    });
    expect(res).toEqual({ data: { results: [] } });
  });

  it('listAllFlows paginates until next is null and returns aggregated results', async () => {
    const httpGet = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          results: [{ uuid: 'f1', name: 'F1' }],
          next: '/api/v2/internal_flows?page=2',
        },
      })
      .mockResolvedValueOnce({
        data: {
          results: [{ uuid: 'f2', name: 'F2' }],
          next: null,
        },
      });
    vi.spyOn(requests as any, '$http', 'get').mockReturnValue({
      get: httpGet,
    } as any);

    const res = await Flows.listAllFlows();
    expect(httpGet).toHaveBeenCalledTimes(2);
    expect(res).toEqual([
      { uuid: 'f1', name: 'F1' },
      { uuid: 'f2', name: 'F2' },
    ]);
  });
});
