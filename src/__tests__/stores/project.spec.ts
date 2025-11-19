import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';
import ChannelsAPI from '@/api/resources/flows/channels';
import ProjectsAPI from '@/api/resources/flows/projects';
import AppsAPI from '@/api/resources/integrations/apps';
import type { AxiosResponse } from 'axios';
import { CHANNEL_MOCK } from '@/__tests__/mocks/channel';

vi.mock('@/api/resources/flows/channels', () => ({
  default: {
    listChannels: vi.fn(),
  },
}));

vi.mock('@/api/resources/flows/projects', () => ({
  default: {
    getProjectInfo: vi.fn(),
  },
}));

vi.mock('@/api/resources/integrations/apps', () => ({
  default: {
    listApps: vi.fn(),
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
      data: { results: [CHANNEL_MOCK] },
    } as AxiosResponse);

    const mockedApps = AppsAPI as Mocked<typeof AppsAPI>;
    mockedApps.listApps.mockResolvedValue({
      data: [{ flowObjectUuid: CHANNEL_MOCK.uuid, uuid: CHANNEL_MOCK.appUuid }],
    } as AxiosResponse);

    expect(store.loadingChannels).toBe(false);
    const promise = store.getProjectChannels();
    expect(store.loadingChannels).toBe(true);
    await promise;

    expect(mocked.listChannels).toHaveBeenCalled();
    expect(mockedApps.listApps).toHaveBeenCalled();
    expect(store.project.channels).toEqual([CHANNEL_MOCK]);
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
