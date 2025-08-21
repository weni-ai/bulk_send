import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import HomeBulkSend from '@/views/BulkSend/HomeBulkSend.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

// Mock i18n
const $t = vi.fn((key) => key);

describe('HomeBulkSend.vue', () => {
  const getStubs = () => ({
    BulkSendHomeLayout: {
      template: '<div><slot name="header" /><slot name="content" /></div>',
    },
    HomeHeader: true,
    MetricsTable: true,
    RecentSends: true,
    ActivateMMLiteModal: {
      template: '<div class="activate-mmlite-modal" />',
    },
    UnnnicDisclaimer: {
      template:
        '<div class="home-bulk-send__mmlite-disclaimer" @click="$emit(\'click\', $event)"><button class="show-more-button" @click="$emit(\'click\', $event)">Show more</button></div>',
      emits: ['click'],
    },
    UnnnicButton: {
      template:
        '<button class="unnnic-button-stub" @click="$emit(\'click\')"></button>',
      emits: ['click'],
    },
    UnnnicInputDatePicker: {
      template:
        "<input class=\"unnnic-input-date-picker-stub\" @change=\"$emit('update:modelValue', { start: '2024-01-01', end: '2024-01-31' })\" />",
      emits: ['update:modelValue'],
    },
    UnnnicInput: {
      template:
        '<input class="unnnic-input-stub" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
  });

  const mountWrapper = (
    options: { channels?: Array<any>; stubAction?: boolean } = {},
  ) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const projectStore = useProjectStore(pinia);

    // Default to showing the disclaimer (WAC present, no MMLite)
    const defaultChannels = [{ uuid: '1', name: 'WAC 1', channel_type: 'WAC' }];

    projectStore.project.channels = options.channels ?? defaultChannels;

    if (options.stubAction !== false) {
      vi.spyOn(projectStore, 'getProjectChannels').mockResolvedValue();
    }

    return mount(HomeBulkSend, {
      global: {
        plugins: [pinia],
        mocks: { $t },
        stubs: getStubs(),
      },
    });
  };

  it('should NOT open the modal when the disclaimer container is clicked (outside button)', async () => {
    const wrapper = mountWrapper();

    const disclaimer = wrapper.find('.home-bulk-send__mmlite-disclaimer');
    await disclaimer.trigger('click');

    expect(wrapper.find('.activate-mmlite-modal').exists()).toBe(false);
  });

  it('should open the modal when the show more button inside the disclaimer is clicked', async () => {
    const wrapper = mountWrapper();

    const button = wrapper.find('.show-more-button');
    await button.trigger('click');

    expect(wrapper.find('.activate-mmlite-modal').exists()).toBe(true);
  });

  it('should call getProjectChannels on mount', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const projectStore = useProjectStore(pinia);
    const spy = vi
      .spyOn(projectStore, 'getProjectChannels')
      .mockResolvedValue();

    mount(HomeBulkSend, {
      global: {
        plugins: [pinia],
        mocks: { $t },
        stubs: getStubs(),
      },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('shows MMLite disclaimer when there is WhatsApp (WAC) but no MMLite channel', () => {
    const wrapper = mountWrapper({
      channels: [{ uuid: '1', name: 'WAC 1', channel_type: 'WAC' }],
    });

    expect(wrapper.find('.home-bulk-send__mmlite').exists()).toBe(true);
    expect(wrapper.find('.home-bulk-send__mmlite-disclaimer').exists()).toBe(
      true,
    );
  });

  it('hides MMLite disclaimer when MMLite channel exists', () => {
    const wrapper = mountWrapper({
      channels: [
        { uuid: '1', name: 'WAC 1', channel_type: 'WAC' },
        { uuid: '2', name: 'WAC MMLite', channel_type: 'WAC', MMLite: true },
      ],
    });

    expect(wrapper.find('.home-bulk-send__mmlite').exists()).toBe(false);
  });

  it('hides MMLite disclaimer when there are no channels', () => {
    const wrapper = mountWrapper({ channels: [] });
    expect(wrapper.find('.home-bulk-send__mmlite').exists()).toBe(false);
  });
});
