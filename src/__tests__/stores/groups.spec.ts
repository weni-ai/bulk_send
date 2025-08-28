import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGroupsStore } from '@/stores/groups';
import Groups from '@/api/resources/groups';
import type { AxiosResponse } from 'axios';
import type { Group } from '@/types/groups';

// Mock API module used by the store
vi.mock('@/api/resources/groups', () => ({
  default: {
    getGroups: vi.fn(),
  },
}));

describe('groups store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getGroups loads, stores data and toggles loading flag', async () => {
    const store = useGroupsStore();

    const mockGroups: Group[] = [
      { id: 1, uuid: 'g-1', name: 'G1', memberCount: 10 },
      { id: 2, uuid: 'g-2', name: 'G2', memberCount: 5 },
    ];

    const mocked = Groups as Mocked<typeof Groups>;
    mocked.getGroups.mockResolvedValue({
      data: { count: 2, results: mockGroups },
    } as AxiosResponse);

    expect(store.loadingGroups).toBe(false);

    const params = { limit: 9, offset: 0, name: '', order: 'name' } as any;
    const promise = store.getGroups('proj-123', params);
    expect(store.loadingGroups).toBe(true);
    await promise;

    expect(mocked.getGroups).toHaveBeenCalledWith('proj-123', params);
    expect(store.groupsCount).toBe(2);
    expect(store.groups).toEqual(mockGroups);
    expect(store.loadingGroups).toBe(false);
  });
});


