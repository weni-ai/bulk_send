import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NewSendButton from '@/components/NewSendButton.vue';
import { useProjectStore } from '@/stores/project';
import { useBroadcastsStore } from '@/stores/broadcasts';

const pushSpy = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushSpy }),
}));

const makeChannel = (overrides?: Partial<any>) => ({
  uuid: 'ch-1',
  name: 'WAC 1',
  channelType: 'WAC',
  appUuid: 'app-1',
  phoneNumber: '5511999999999',
  ...overrides,
});

describe('components/NewSendButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountBtn = () =>
    shallowMount(NewSendButton, {
      props: {
        text: 'New',
        type: 'primary',
        iconLeft: 'add-1',
        loading: false,
      },
      global: {
        stubs: {
          UnnnicButton: {
            name: 'UnnnicButton',
            props: ['text', 'type', 'iconLeft', 'loading'],
            emits: ['click'],
            template:
              '<button data-test="btn" @click="$emit(\'click\')"><slot /></button>',
          },
          ChannelSelectionModal: {
            name: 'ChannelSelectionModal',
            template: '<div data-test="channel-modal"></div>',
          },
        },
      },
    });

  it('opens ChannelSelectionModal when there are multiple WPP channels', async () => {
    const projectStore = useProjectStore();
    projectStore.project.channels = [
      makeChannel({ uuid: 'a' }),
      makeChannel({ uuid: 'b', name: 'WAC 2' }),
    ];

    const wrapper = mountBtn();
    await wrapper.find('[data-test="btn"]').trigger('click');

    // Modal should be rendered after click
    expect(
      wrapper.findComponent({ name: 'ChannelSelectionModal' }).exists(),
    ).toBe(true);
  });

  it('navigates immediately when there is a single WPP channel', async () => {
    const projectStore = useProjectStore();
    const broadcastsStore = useBroadcastsStore();
    const setChannelSpy = vi.spyOn(broadcastsStore, 'setChannel');

    const onlyChannel = makeChannel();
    projectStore.project.channels = [onlyChannel];

    const wrapper = mountBtn();
    await wrapper.find('[data-test="btn"]').trigger('click');

    expect(setChannelSpy).toHaveBeenCalledWith(onlyChannel);
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'NewBroadcast',
      params: { channelUuid: onlyChannel.uuid },
    });
  });

  it('handles update:channel from ChannelSelectionModal by setting channel and navigating', async () => {
    const projectStore = useProjectStore();
    const broadcastsStore = useBroadcastsStore();
    const setChannelSpy = vi.spyOn(broadcastsStore, 'setChannel');

    const channels = [
      makeChannel({ uuid: 'x' }),
      makeChannel({ uuid: 'y', name: 'WAC 2' }),
    ];
    projectStore.project.channels = channels;

    const wrapper = mountBtn();
    await wrapper.findComponent({ name: 'UnnnicButton' }).trigger('click');

    const chosen = channels[1];
    // Emit selection result from modal
    await wrapper
      .findComponent({ name: 'ChannelSelectionModal' })
      .vm.$emit('update:channel', chosen);

    expect(setChannelSpy).toHaveBeenCalledWith(chosen);
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'NewBroadcast',
      params: { channelUuid: chosen.uuid },
    });
  });
});
