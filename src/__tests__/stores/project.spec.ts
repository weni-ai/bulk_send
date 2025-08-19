import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';
import Channels from '@/api/resources/channels';
import type { AxiosResponse } from 'axios';

// Mock API module used by the store
vi.mock('@/api/resources/channels', () => ({
  default: {
    listChannels: vi.fn(),
  },
}));

describe('project store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getProjectChannels loads channels and toggles loading flag', async () => {
    const store = useProjectStore();

    const mockResults = [
      { uuid: '1', name: 'WAC 1', channel_type: 'WAC' },
      { uuid: '2', name: 'SMS 1', channel_type: 'SMS' },
    ];

    const mockedChannels = Channels as Mocked<typeof Channels>;
    mockedChannels.listChannels.mockResolvedValue({
      data: { results: mockResults },
    } as AxiosResponse);

    expect(store.loadingChannels).toBe(false);

    const promise = store.getProjectChannels();
    expect(store.loadingChannels).toBe(true);
    await promise;

    expect(mockedChannels.listChannels).toHaveBeenCalledTimes(1);
    expect(store.project.channels).toEqual(mockResults);
    expect(store.loadingChannels).toBe(false);
  });
});
