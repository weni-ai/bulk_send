import { describe, it, expect, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ChannelSelectionModal from '@/components/modals/ChannelSelectionModal.vue';
import { useProjectStore } from '@/stores/project';
import { useBroadcastsStore } from '@/stores/broadcasts';

const makeChannel = (overrides?: Partial<any>) => ({
  uuid: 'ch-1',
  name: 'WAC 1',
  channelType: 'WAC',
  phoneNumber: '5511999999999',
  appUuid: 'app-1',
  ...overrides,
});

describe('components/modals/ChannelSelectionModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountModal = () =>
    shallowMount(ChannelSelectionModal, {
      props: { modelValue: true },
      global: {
        stubs: {
          UnnnicModalDialog: {
            name: 'UnnnicModalDialog',
            props: [
              'modelValue',
              'title',
              'primaryButtonProps',
              'secondaryButtonProps',
              'size',
              'showActionsDivider',
              'showCloseIcon',
            ],
            emits: [
              'update:model-value',
              'primary-button-click',
              'secondary-button-click',
            ],
            template: '<div><slot /></div>',
          },
          UnnnicSelectSmart: {
            name: 'UnnnicSelectSmart',
            props: [
              'options',
              'modelValue',
              'isLoading',
              'orderedByIndex',
              'selectFirst',
            ],
            emits: ['update:model-value'],
            template: '<select />',
          },
        },
        mocks: {
          $t: (k: string) => k,
        },
      },
    });

  it('renders options from projectStore.wppChannels', () => {
    const projectStore = useProjectStore();
    projectStore.project.channels = [
      makeChannel({ uuid: 'a', name: 'A' }),
      makeChannel({ uuid: 'b', name: 'B' }),
    ];

    const wrapper = mountModal();
    const select = wrapper.findComponent({ name: 'UnnnicSelectSmart' });
    const options = select.props('options') as Array<{
      label: string;
      value: string;
    }>;
    expect(options).toEqual([
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ]);
  });

  it('exposes selected channel as modelValue to select when broadcastsStore has a channel', () => {
    const projectStore = useProjectStore();
    const broadcastsStore = useBroadcastsStore();
    const ch = makeChannel({ uuid: 'z', name: 'Chosen' });
    projectStore.project.channels = [ch];
    broadcastsStore.setChannel(ch);

    const wrapper = mountModal();
    const select = wrapper.findComponent({ name: 'UnnnicSelectSmart' });
    expect(select.props('modelValue')).toEqual([
      { label: 'Chosen', value: 'z' },
    ]);
  });

  it('emits update:modelValue when modal value changes', async () => {
    const wrapper = mountModal();
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('update:model-value', false);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('updates broadcastsStore channel on select update and emits update:channel on primary click', async () => {
    const projectStore = useProjectStore();
    const broadcastsStore = useBroadcastsStore();
    const ch = makeChannel({ uuid: 'x', name: 'X' });
    projectStore.project.channels = [ch];

    const wrapper = mountModal();

    const select = wrapper.findComponent({ name: 'UnnnicSelectSmart' });
    await select.vm.$emit('update:model-value', [{ label: 'X', value: 'x' }]);

    expect(broadcastsStore.newBroadcast.channel).toEqual(ch);

    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('primary-button-click');

    expect(wrapper.emitted('update:channel')?.[0]).toEqual([ch]);
  });
});
