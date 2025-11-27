import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import HomeBulkSend from '@/views/BulkSend/HomeBulkSend.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useTemplatesStore } from '@/stores/templates';
import { moduleStorage } from '../../../utils/storage';

// Mock useI18n to avoid installing i18n plugin
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// Mock i18n
const $t = vi.fn((key) => key);

describe('HomeBulkSend.vue', () => {
  const DEFAULT_PROJECT_UUID = 'proj-123';
  const DEFAULT_CHANNELS = [{ uuid: '1', name: 'WAC 1', channelType: 'WAC' }];
  const SELECTOR = {
    header: '[data-test="home-header"]',
    metricsTable: '[data-test="metrics-table"]',
    recentSends: '[data-test="recent-sends"]',
    activateMMLiteModal: '[data-test="activate-mmlite-modal"]',
    mmliteDisclaimer: '[data-test="mmlite-disclaimer"]',
    showMoreButton: '[data-test="show-more-button"]',
    skeleton: '[data-test="skeleton"]',
  } as const;

  const STUBS = {
    BulkSendHomeLayout: {
      template: '<div><slot name="header" /><slot name="content" /></div>',
    },
    HomeHeader: { template: '<div data-test="home-header" />' },
    MetricsTable: { template: '<div data-test="metrics-table" />' },
    RecentSends: { template: '<div data-test="recent-sends" />' },
    ActivateMMLiteModal: {
      template: '<div data-test="activate-mmlite-modal" />',
    },
    UnnnicDisclaimer: {
      emits: ['click'],
      template:
        '<div data-test="mmlite-disclaimer" @click="$emit(\'click\', $event)"><button data-test="show-more-button" @click="$emit(\'click\', $event)">Show more</button></div>',
    },
    UnnnicSkeletonLoading: { template: '<div data-test="skeleton" />' },
  } as const;

  const mountWrapper = (
    options: {
      channels?: Array<any>;
      stubProjectAction?: boolean;
      stubBroadcastAction?: boolean;
      stubTemplatesAction?: boolean;
      projectUuid?: string;
      loadingMonthPerformance?: boolean;
    } = {},
  ) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const projectStore = useProjectStore(pinia);
    const broadcastsStore = useBroadcastsStore(pinia);
    const templatesStore = useTemplatesStore(pinia);

    projectStore.project.uuid = options.projectUuid ?? DEFAULT_PROJECT_UUID;
    projectStore.project.channels = options.channels ?? DEFAULT_CHANNELS;
    broadcastsStore.loadingBroadcastsMonthPerformance =
      options.loadingMonthPerformance ?? false;

    const projectSpy =
      options.stubProjectAction !== false
        ? vi.spyOn(projectStore, 'getProjectChannels').mockResolvedValue()
        : undefined;
    const broadcastSpy =
      options.stubBroadcastAction !== false
        ? vi
            .spyOn(broadcastsStore, 'getBroadcastsMonthPerformance')
            .mockResolvedValue()
        : undefined;
    const templatesPricingSpy =
      options.stubTemplatesAction !== false
        ? vi.spyOn(templatesStore, 'getTemplatePricing').mockResolvedValue()
        : undefined;

    const wrapper = mount(HomeBulkSend, {
      global: {
        plugins: [pinia],
        mocks: { $t },
        stubs: STUBS,
      },
    });

    return {
      wrapper,
      projectStore,
      broadcastsStore,
      projectSpy,
      broadcastSpy,
      templatesPricingSpy,
    };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not open modal when clicking outside the button in disclaimer', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.find(SELECTOR.mmliteDisclaimer).trigger('click');
    expect(wrapper.find(SELECTOR.activateMMLiteModal).exists()).toBe(false);
  });

  it('opens modal when clicking the show more button inside disclaimer', async () => {
    const { wrapper } = mountWrapper();
    await wrapper.find(SELECTOR.showMoreButton).trigger('click');
    expect(wrapper.find(SELECTOR.activateMMLiteModal).exists()).toBe(true);
  });

  it('calls getProjectChannels on mount', async () => {
    const { projectSpy } = mountWrapper();
    expect(projectSpy).toHaveBeenCalledTimes(1);
  });

  it('calls getBroadcastsMonthPerformance on mount with project uuid', async () => {
    const { wrapper, broadcastSpy } = mountWrapper({
      projectUuid: 'proj-xyz',
    });
    await wrapper.vm.$nextTick();
    expect(broadcastSpy).toHaveBeenCalledWith('proj-xyz');
  });

  it('shows MMLite disclaimer when there is WAC but no MMLite channel', () => {
    const { wrapper } = mountWrapper({
      channels: [{ uuid: '1', name: 'WAC 1', channelType: 'WAC' }],
    });

    expect(wrapper.find(SELECTOR.mmliteDisclaimer).exists()).toBe(true);
  });

  it('shows MMLite disclaimer when WAC channel exists without MMLite', () => {
    const { wrapper } = mountWrapper({
      channels: [
        { uuid: '1', name: 'WAC 1', channelType: 'WAC' },
        { uuid: '2', name: 'WAC MMLite', channelType: 'WAC', MMLite: true },
      ],
    });

    expect(wrapper.find(SELECTOR.mmliteDisclaimer).exists()).toBe(true);
  });

  it('hides MMLite disclaimer when all WAC channels have MMLite', () => {
    const { wrapper } = mountWrapper({
      channels: [
        { uuid: '1', name: 'WAC 1', channelType: 'WAC', MMLite: true },
        { uuid: '2', name: 'WAC 2', channelType: 'WAC', MMLite: true },
      ],
    });
    expect(wrapper.find(SELECTOR.mmliteDisclaimer).exists()).toBe(false);
  });

  it('hides MMLite disclaimer do not remind is true', () => {
    moduleStorage.setItem('mmlite_do_not_remind', 'true');
    const { wrapper } = mountWrapper({
      channels: [
        { uuid: '1', name: 'WAC 1', channelType: 'WAC' },
        { uuid: '2', name: 'WAC MMLite', channelType: 'WAC' },
      ],
    });
    expect(wrapper.find(SELECTOR.mmliteDisclaimer).exists()).toBe(false);
    moduleStorage.removeItem('mmlite_do_not_remind');
  });

  it('hides MMLite disclaimer when there are no channels', () => {
    const { wrapper } = mountWrapper({ channels: [] });
    expect(wrapper.find(SELECTOR.mmliteDisclaimer).exists()).toBe(false);
  });

  it('shows skeleton when month performance is loading', () => {
    const { wrapper } = mountWrapper({ loadingMonthPerformance: true });
    expect(wrapper.find(SELECTOR.skeleton).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.metricsTable).exists()).toBe(false);
  });

  it('shows metrics table when month performance is loaded', () => {
    const { wrapper } = mountWrapper({ loadingMonthPerformance: false });
    expect(wrapper.find(SELECTOR.metricsTable).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.skeleton).exists()).toBe(false);
  });
});
