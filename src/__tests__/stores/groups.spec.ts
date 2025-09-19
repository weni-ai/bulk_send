import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGroupsStore } from '@/stores/groups';
import GroupsAPI from '@/api/resources/groups';
import type { AxiosResponse } from 'axios';

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

  it('getGroups toggles loading and stores results and count', async () => {
    const store = useGroupsStore();
    const mocked = GroupsAPI as Mocked<typeof GroupsAPI>;
    mocked.getGroups.mockResolvedValue({
      data: {
        results: [{ id: 1, uuid: 'g1', name: 'G1', memberCount: 2 }],
        count: 1,
      },
    } as AxiosResponse);

    expect(store.loadingGroups).toBe(false);
    const promise = store.getGroups('proj-1', { offset: 0, limit: 10 });
    expect(store.loadingGroups).toBe(true);
    await promise;

    expect(mocked.getGroups).toHaveBeenCalledWith('proj-1', {
      offset: 0,
      limit: 10,
    });
    expect(store.groups).toHaveLength(1);
    expect(store.groupsCount).toBe(1);
    expect(store.loadingGroups).toBe(false);
  });

  // TODO: this test is not working as expected, it should test if the page is being incremented too
  it('listAllGroups paginates until next is null and aggregates results', async () => {
    const store = useGroupsStore();
    const mocked = GroupsAPI as Mocked<typeof GroupsAPI>;

    // Simulate 2 pages
    mocked.getGroups
      .mockResolvedValueOnce({
        data: {
          results: Array.from({ length: 2 }).map((_, i) => ({
            id: i + 1,
            uuid: `g${i + 1}`,
            name: `G${i + 1}`,
            memberCount: 1,
          })),
          next: 'has-next',
        },
      } as AxiosResponse)
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 3, uuid: 'g3', name: 'G3', memberCount: 1 }],
          next: null,
        },
      } as AxiosResponse);

    expect(store.loadingGroups).toBe(false);
    const promise = store.listAllGroups('proj-1');
    expect(store.loadingGroups).toBe(true);
    await promise;

    expect(mocked.getGroups).toHaveBeenCalledTimes(2);
    expect(store.groups.map((g) => g.id)).toEqual([1, 2, 3]);
    expect(store.loadingGroups).toBe(false);
  });
});
