import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';
import ChannelsAPI from '@/api/resources/channels';
import ProjectsAPI from '@/api/resources/projects';
import type { AxiosResponse } from 'axios';

vi.mock('@/api/resources/channels', () => ({
  default: {
    listChannels: vi.fn(),
  },
}));

vi.mock('@/api/resources/projects', () => ({
  default: {
    getProjectInfo: vi.fn(),
  },
}));

describe('project store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('setProjectUuid sets uuid on project', () => {
    const store = useProjectStore();
    store.setProjectUuid('proj-123');
    expect(store.project.uuid).toBe('proj-123');
  });

  it('getProjectChannels toggles loading and stores channels', async () => {
    const store = useProjectStore();
    const mocked = ChannelsAPI as Mocked<typeof ChannelsAPI>;
    mocked.listChannels.mockResolvedValue({
      data: { results: [{ uuid: 'ch1', channeltype: 'WA' }] },
    } as AxiosResponse);

    expect(store.loadingChannels).toBe(false);
    const promise = store.getProjectChannels();
    expect(store.loadingChannels).toBe(true);
    await promise;

    expect(mocked.listChannels).toHaveBeenCalled();
    expect(store.project.channels).toEqual([
      { uuid: 'ch1', channeltype: 'WA' },
    ]);
    expect(store.loadingChannels).toBe(false);
  });

  it('getProjectInfo toggles loading and stores brainOn', async () => {
    const store = useProjectStore();
    const mocked = ProjectsAPI as Mocked<typeof ProjectsAPI>;
    mocked.getProjectInfo.mockResolvedValue({
      data: { brainOn: true },
    } as AxiosResponse);

    expect(store.loadingProjectInfo).toBe(false);
    const promise = store.getProjectInfo();
    expect(store.loadingProjectInfo).toBe(true);
    await promise;

    expect(mocked.getProjectInfo).toHaveBeenCalled();
    expect(store.project.brainOn).toBe(true);
    expect(store.loadingProjectInfo).toBe(false);
  });
});
