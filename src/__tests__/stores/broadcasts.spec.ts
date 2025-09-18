import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useBroadcastsStore } from '@/stores/broadcasts';
import Broadcasts from '@/api/resources/broadcasts';
import type { AxiosResponse } from 'axios';
import type { BroadcastStatistic } from '@/types/broadcast';
import { NewBroadcastPage } from '@/constants/broadcasts';
import { TemplateStatus } from '@/constants/templates';
import { createGroup } from '../utils/factories';
import { useTemplatesStore } from '@/stores/templates';

// Mock API module used by the store
vi.mock('@/api/resources/broadcasts', () => ({
  default: {
    getBroadcastsStatistics: vi.fn(),
    getBroadcastsMonthPerformance: vi.fn(),
    createGroupFromStatus: vi.fn(),
    createBroadcast: vi.fn(),
    uploadMedia: vi.fn(),
  },
}));

describe('broadcasts store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getBroadcastsStatistics loads, maps dates, stores data and toggles loading flag', async () => {
    const store = useBroadcastsStore();

    const raw: any = {
      id: 1,
      name: 'Test',
      status: 'S',
      createdBy: 'user',
      createdOn: '2024-01-01T00:00:00Z',
      modifiedOn: '2024-01-02T00:00:00Z',
      groups: [1],
      template: { name: 'T' },
      statistics: {
        processed: 1,
        sent: 1,
        delivered: 1,
        read: 1,
        failed: 0,
        contactCount: 1,
      },
    };

    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.getBroadcastsStatistics.mockResolvedValue({
      data: { count: 1, results: [raw] },
    } as AxiosResponse);

    expect(store.loadingBroadcastsStatistics).toBe(false);

    const promise = store.getBroadcastsStatistics('proj-123', {
      offset: 0,
      limit: 5,
    });
    expect(store.loadingBroadcastsStatistics).toBe(true);
    await promise;

    expect(mocked.getBroadcastsStatistics).toHaveBeenCalledWith('proj-123', {
      offset: 0,
      limit: 5,
    });
    expect(store.broadcastsStatisticsCount).toBe(1);
    expect(store.broadcastsStatistics).toHaveLength(1);
    const item = store.broadcastsStatistics[0] as BroadcastStatistic;
    expect(item.createdOn instanceof Date).toBe(true);
    expect(item.modifiedOn instanceof Date).toBe(true);
    expect(store.loadingBroadcastsStatistics).toBe(false);
  });

  it('getBroadcastsMonthPerformance loads and stores month stats, toggling loading flag', async () => {
    const store = useBroadcastsStore();
    const templateStore = useTemplatesStore();
    templateStore.templatePricing.rates.marketing = 1.2;
    templateStore.templatePricing.currency = 'BRL';
    const pricingSpy = vi
      .spyOn(templateStore, 'getTemplatePricing')
      .mockResolvedValue(undefined as any);

    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.getBroadcastsMonthPerformance.mockResolvedValue({
      data: {
        last30DaysStats: { totalSent: 42 },
        successRate30Days: 0.77,
      },
    } as AxiosResponse);

    expect(store.loadingBroadcastsMonthPerformance).toBe(false);
    const promise = store.getBroadcastsMonthPerformance('proj-123');
    expect(store.loadingBroadcastsMonthPerformance).toBe(true);
    await promise;

    expect(mocked.getBroadcastsMonthPerformance).toHaveBeenCalledWith(
      'proj-123',
    );
    expect(store.broadcastMonthPerformance.totalSent).toBe(42);
    expect(store.broadcastMonthPerformance.successRate).toBe(0.77);
    const cost = 1.2 * 42;
    expect(store.broadcastMonthPerformance.estimatedCost).toBe(
      `R$${cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    );
    expect(pricingSpy).toHaveBeenCalled();
    expect(store.loadingBroadcastsMonthPerformance).toBe(false);
  });

  it('createGroupFromStatus calls API and toggles loading flag', async () => {
    const store = useBroadcastsStore();

    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.createGroupFromStatus.mockResolvedValue({
      data: { id: 7 },
    } as AxiosResponse);

    expect(store.loadingCreateGroupFromStatus).toBe(false);
    const promise = store.createGroupFromStatus(
      'proj-123',
      'Group Name',
      99,
      'failed',
    );
    expect(store.loadingCreateGroupFromStatus).toBe(true);
    const result = await promise;

    expect(mocked.createGroupFromStatus).toHaveBeenCalledWith(
      'proj-123',
      'Group Name',
      99,
      'failed',
    );
    expect(result).toEqual({ id: 7 });
    expect(store.loadingCreateGroupFromStatus).toBe(false);
  });

  it('setter actions update newBroadcast state accordingly', () => {
    const store = useBroadcastsStore();

    // page
    store.setNewBroadcastPage(NewBroadcastPage.CONFIRM_AND_SEND);
    expect(store.newBroadcast.currentPage).toBe(
      NewBroadcastPage.CONFIRM_AND_SEND,
    );

    // open/close toggles
    store.setGroupSelectionOpen(false);
    expect(store.newBroadcast.groupSelectionOpen).toBe(false);
    store.setContactImportOpen(true);
    expect(store.newBroadcast.contactImportOpen).toBe(true);

    // selected groups
    const groups = [createGroup({ id: 1 }), createGroup({ id: 2 })];
    store.setSelectedGroups(groups as any);
    expect(store.newBroadcast.selectedGroups).toEqual(groups);

    // selected template
    const template = {
      uuid: 't-1',
      name: 'Welcome',
      createdOn: '2024-01-01T00:00:00Z',
      category: 'CAT',
      language: 'en',
      body: { text: 'Hello' },
      status: TemplateStatus.APPROVED,
    } as any;
    store.setSelectedTemplate(template);
    expect(store.newBroadcast.selectedTemplate).toEqual(template);
  });

  it('loading flags are reset to false when API calls fail', async () => {
    const store = useBroadcastsStore();
    const mocked = Broadcasts as Mocked<typeof Broadcasts>;

    mocked.getBroadcastsStatistics.mockRejectedValue(new Error('fail-stats'));
    await expect(
      store.getBroadcastsStatistics('proj', { offset: 0, limit: 5 }),
    ).rejects.toThrow('fail-stats');
    expect(store.loadingBroadcastsStatistics).toBe(false);

    mocked.getBroadcastsMonthPerformance.mockRejectedValue(
      new Error('fail-month'),
    );
    await expect(store.getBroadcastsMonthPerformance('proj')).rejects.toThrow(
      'fail-month',
    );
    expect(store.loadingBroadcastsMonthPerformance).toBe(false);

    mocked.createGroupFromStatus.mockRejectedValue(
      new Error('fail-create-group'),
    );
    await expect(
      store.createGroupFromStatus('proj', 'G', 1, 'failed'),
    ).rejects.toThrow('fail-create-group');
    expect(store.loadingCreateGroupFromStatus).toBe(false);
  });

  it('createBroadcast forwards args to API and toggles loading flag', async () => {
    const store = useBroadcastsStore();
    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.createBroadcast.mockResolvedValue({ data: { id: 1 } } as any);

    expect(store.loadingCreateBroadcast).toBe(false);
    const tpl = { uuid: 'tpl-1' } as any;
    const vars = ['@fields.name'];
    const groups = ['g1'];
    const attachment = { url: 'https://cdn/x.jpg', type: 'image' };

    const promise = store.createBroadcast(
      'My Broadcast',
      tpl,
      vars,
      groups,
      attachment,
    );
    expect(store.loadingCreateBroadcast).toBe(true);
    const result = await promise;

    expect(mocked.createBroadcast).toHaveBeenCalledWith(
      'My Broadcast',
      tpl,
      vars,
      groups,
      attachment,
    );
    expect(result).toEqual({ id: 1 });
    expect(store.loadingCreateBroadcast).toBe(false);
  });

  it('uploadMedia stores returned url and type, toggling loading flag', async () => {
    const store = useBroadcastsStore();
    const mocked = Broadcasts as Mocked<typeof Broadcasts>;
    mocked.uploadMedia.mockResolvedValue({
      data: { url: 'https://cdn/y.pdf', type: 'document' },
    } as any);

    expect(store.loadingUploadMedia).toBe(false);
    const blob = new Blob(['x'], { type: 'application/pdf' });
    const promise = store.uploadMedia(blob as unknown as File);
    expect(store.loadingUploadMedia).toBe(true);
    await promise;
    expect(store.newBroadcast.headerMediaFileUrl).toBe('https://cdn/y.pdf');
    expect(store.newBroadcast.headerMediaFileType).toBe('document');
    expect(store.loadingUploadMedia).toBe(false);
  });
});
