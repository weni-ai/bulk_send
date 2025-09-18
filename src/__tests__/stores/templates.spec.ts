import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTemplatesStore } from '@/stores/templates';
import TemplatesAPI from '@/api/resources/templates';
import type { AxiosResponse } from 'axios';

vi.mock('@/api/resources/templates', () => ({
  default: {
    getTemplates: vi.fn(),
    getTemplate: vi.fn(),
    getTemplatePricing: vi.fn(),
  },
}));

describe('templates store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchTemplates toggles loading and stores results/count', async () => {
    const store = useTemplatesStore();
    const mocked = TemplatesAPI as Mocked<typeof TemplatesAPI>;
    mocked.getTemplates.mockResolvedValue({
      data: { results: [{ id: 1 }], count: 1 },
    } as AxiosResponse);

    expect(store.loadingTemplates).toBe(false);
    const promise = store.fetchTemplates({ offset: 0, limit: 10 } as any);
    expect(store.loadingTemplates).toBe(true);
    await promise;

    expect(mocked.getTemplates).toHaveBeenCalled();
    expect(store.templates).toEqual([{ id: 1 }]);
    expect(store.templatesCount).toBe(1);
    expect(store.loadingTemplates).toBe(false);
  });

  it('getTemplate proxies to API', async () => {
    const store = useTemplatesStore();
    const mocked = TemplatesAPI as Mocked<typeof TemplatesAPI>;
    mocked.getTemplate.mockResolvedValue({ data: { id: 7 } } as AxiosResponse);
    const res = await store.getTemplate(7);
    expect(mocked.getTemplate).toHaveBeenCalledWith(7);
    expect(res).toEqual({ data: { id: 7 } });
  });

  it('getTemplatePricing toggles loading and maps rates to numbers', async () => {
    const store = useTemplatesStore();
    const mocked = TemplatesAPI as Mocked<typeof TemplatesAPI>;
    mocked.getTemplatePricing.mockResolvedValue({
      data: {
        currency: 'BRL',
        rates: {
          marketing: '1.2',
          utility: '2.5',
          authentication: '3',
          service: '0',
        },
      },
    } as any);

    expect(store.loadingTemplatePricing).toBe(false);
    const promise = store.getTemplatePricing();
    expect(store.loadingTemplatePricing).toBe(true);
    await promise;

    expect(mocked.getTemplatePricing).toHaveBeenCalled();
    expect(store.templatePricing.currency).toBe('BRL');
    expect(store.templatePricing.rates).toEqual({
      marketing: 1.2,
      utility: 2.5,
      authentication: 3,
      service: 0,
    });
    expect(store.loadingTemplatePricing).toBe(false);
  });
});
