import { describe, it, expect, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useProjectStore } from '@/stores/project';
import { DEFAULT_PROJECT_UUID } from '@/__tests__/utils/constants';
import NewContactGroup from '@/components/modals/NewContactGroup.vue';
import unnnic from '@weni/unnnic-system';

// Minimal i18n mock used in script setup and template
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) =>
      key.includes('modals.new_contact_group.categories') ? 'Failed' : key,
  }),
}));

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

const stubs = {
  UnnnicModalDialog: {
    // Emits buttons to simulate primary/secondary actions and renders default slot
    props: [
      'modelValue',
      'title',
      'primaryButtonProps',
      'secondaryButtonProps',
      'size',
      'showActionsDivider',
      'showCloseIcon',
    ],
    template:
      '<div class="unnnic-modal-dialog-stub"><slot /><button class="modal-stub__primary" @click="$emit(\'primary-button-click\')">primary</button><button class="modal-stub__secondary" @click="$emit(\'secondary-button-click\')">secondary</button></div>',
  },
  UnnnicInput: {
    props: ['modelValue', 'label'],
    emits: ['update:model-value'],
    template:
      '<input class="unnnic-input-stub" :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
  },
  UnnnicDisclaimer: {
    props: ['text', 'icon', 'scheme'],
    template: '<div class="unnnic-disclaimer-stub">{{ text }}</div>',
  },
};

const mountWrapper = (props = {}) => {
  const pinia = createPinia();
  setActivePinia(pinia);

  const projectStore = useProjectStore(pinia);
  projectStore.project.uuid = DEFAULT_PROJECT_UUID;

  return mount(NewContactGroup, {
    props: {
      modelValue: true,
      contactCount: 12,
      category: 'failed',
      broadcastName: 'Promo',
      broadcastID: 42,
      ...props,
    },
    global: {
      plugins: [pinia],
      stubs,
      mocks: {
        $t: (key: string) =>
          key.includes('modals.new_contact_group.categories') ? 'Failed' : key,
      },
    },
  }) as VueWrapper;
};

describe('NewContactGroup.vue', () => {
  it('renders with initial group name from props', () => {
    const wrapper = mountWrapper();
    const input = wrapper.find('.unnnic-input-stub');
    expect((input.element as HTMLInputElement).value).toBe('Failed - Promo');
    expect(wrapper.find('.unnnic-disclaimer-stub').exists()).toBe(true);
  });

  it('updates group name when input changes', async () => {
    const wrapper = mountWrapper();
    const input = wrapper.find('.unnnic-input-stub');
    await input.setValue('New Group Name');
    expect((input.element as HTMLInputElement).value).toBe('New Group Name');
  });

  it('calls createGroupFromStatus on primary and closes modal', async () => {
    const wrapper = mountWrapper();
    const broadcastsStore = useBroadcastsStore();
    const spy = vi
      .spyOn(broadcastsStore, 'createGroupFromStatus')
      .mockResolvedValue({});

    await wrapper.find('.modal-stub__primary').trigger('click');

    expect(spy).toHaveBeenCalledWith(
      DEFAULT_PROJECT_UUID,
      'Failed - Promo',
      42,
      'failed',
    );
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    expect(unnnic.unnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'success' }),
        seconds: 5,
      }),
    );
  });

  it('emits close on secondary', async () => {
    const wrapper = mountWrapper();
    await wrapper.find('.modal-stub__secondary').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('shows error alert on failure and keeps modal open', async () => {
    const wrapper = mountWrapper();
    const broadcastsStore = useBroadcastsStore();
    vi.spyOn(broadcastsStore, 'createGroupFromStatus').mockRejectedValue(
      new Error('fail'),
    );

    await wrapper.find('.modal-stub__primary').trigger('click');

    expect(unnnic.unnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'error' }),
        seconds: 10,
      }),
    );
    // should not emit close on error
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
