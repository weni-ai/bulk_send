import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTemplatesStore } from '@/stores/templates';
import TemplatesAPI from '@/api/resources/templates';
import type { AxiosResponse } from 'axios';

vi.mock('@/api/resources/templates', () => ({
  default: {
    getTemplates: vi.fn(),
    getTemplate: vi.fn(),
  },
}));

describe('templates store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchTemplates toggles loading and stores results and count', async () => {
    const store = useTemplatesStore();
    const mocked = TemplatesAPI as Mocked<typeof TemplatesAPI>;

    mocked.getTemplates.mockResolvedValue({
      data: {
        count: 2,
        results: [
          {
            uuid: 't1',
            name: 'Welcome',
            createdOn: '2024-01-01T00:00:00Z',
            category: 'CAT',
            language: 'en',
            body: { text: 'Hello' },
            status: 'A',
          },
          {
            uuid: 't2',
            name: 'Promo',
            createdOn: '2024-02-01T00:00:00Z',
            category: 'CAT',
            language: 'es',
            body: { text: 'Promo Body' },
            status: 'P',
          },
        ],
      },
    } as AxiosResponse);

    expect(store.loadingTemplates).toBe(false);
    const promise = store.fetchTemplates({ limit: 5, offset: 0 });
    expect(store.loadingTemplates).toBe(true);
    await promise;

    expect(mocked.getTemplates).toHaveBeenCalledWith({ limit: 5, offset: 0 });
    expect(store.templatesCount).toBe(2);
    expect(store.templates).toHaveLength(2);
    expect(store.templates[0].name).toBe('Welcome');
    expect(store.loadingTemplates).toBe(false);
  });

  it('fetchTemplates resets loading on failure', async () => {
    const store = useTemplatesStore();
    const mocked = TemplatesAPI as Mocked<typeof TemplatesAPI>;
    mocked.getTemplates.mockRejectedValue(new Error('fail'));

    expect(store.loadingTemplates).toBe(false);
    await expect(store.fetchTemplates({ limit: 5, offset: 0 })).rejects.toThrow(
      'fail',
    );
    expect(store.loadingTemplates).toBe(false);
  });

  it('getTemplate proxies to API', async () => {
    const store = useTemplatesStore();
    const mocked = TemplatesAPI as Mocked<typeof TemplatesAPI>;

    mocked.getTemplate.mockResolvedValue({
      data: { id: 123 },
    } as AxiosResponse);
    const result = await store.getTemplate(123);
    expect(mocked.getTemplate).toHaveBeenCalledWith(123);
    expect(result).toEqual({ data: { id: 123 } });
  });
});
