import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Templates from '@/api/resources/flows/templates';
import requests from '@/api/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/flows/templates', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('proj-abc');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getTemplates calls endpoint with project uuid and query params', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { results: [], count: 0 } });

    const params = { offset: 5, limit: 10, name: 'promo' } as any;
    const res = await Templates.getTemplates(params);

    expect(httpGet).toHaveBeenCalledWith('/api/v2/templates/translations', {
      params: { project_uuid: 'proj-abc', ...params },
    });
    expect(res).toEqual({ data: { results: [], count: 0 } });
  });

  it('getTemplate calls endpoint with project uuid', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { id: 7 } });

    const res = await Templates.getTemplate(7);
    expect(httpGet).toHaveBeenCalledWith('/api/v2/templates/translations/7', {
      params: { project_uuid: 'proj-abc' },
    });
    expect(res).toEqual({ data: { id: 7 } });
  });

  it('getTemplatePricing calls billing endpoint with project uuid', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { currency: 'USD', rates: {} } });

    const res = await Templates.getTemplatePricing();
    expect(httpGet).toHaveBeenCalledWith('/api/v2/billing_pricing', {
      params: { project_uuid: 'proj-abc' },
    });
    expect(res).toEqual({ data: { currency: 'USD', rates: {} } });
  });
});
