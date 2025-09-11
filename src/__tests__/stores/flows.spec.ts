import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useFlowsStore } from '@/stores/flows';
import FlowsAPI from '@/api/resources/flows';
import type { AxiosResponse } from 'axios';

vi.mock('@/api/resources/flows', () => ({
  default: {
    getFlows: vi.fn(),
    listAllFlows: vi.fn(),
  },
}));

describe('flows store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchFlows toggles loading and stores results', async () => {
    const store = useFlowsStore();
    const mocked = FlowsAPI as Mocked<typeof FlowsAPI>;
    mocked.getFlows.mockResolvedValue({
      data: { results: [{ uuid: 'f1', name: 'F1' }] },
    } as AxiosResponse);

    expect(store.loadingFlows).toBe(false);
    const promise = store.fetchFlows();
    expect(store.loadingFlows).toBe(true);
    await promise;

    expect(mocked.getFlows).toHaveBeenCalled();
    expect(store.flows).toEqual([{ uuid: 'f1', name: 'F1' }]);
    expect(store.loadingFlows).toBe(false);
  });

  it('listAllFlows toggles loading and stores combined results', async () => {
    const store = useFlowsStore();
    const mocked = FlowsAPI as Mocked<typeof FlowsAPI>;
    mocked.listAllFlows.mockResolvedValue([
      { uuid: 'f1', name: 'F1' },
      { uuid: 'f2', name: 'F2' },
    ] as any);

    expect(store.loadingFlows).toBe(false);
    const promise = store.listAllFlows();
    expect(store.loadingFlows).toBe(true);
    await promise;

    expect(mocked.listAllFlows).toHaveBeenCalled();
    expect(store.flows).toEqual([
      { uuid: 'f1', name: 'F1' },
      { uuid: 'f2', name: 'F2' },
    ]);
    expect(store.loadingFlows).toBe(false);
  });
});
