import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ActivateMMLiteModal from '@/components/modals/ActivateMMLiteModal.vue';
import { useProjectStore } from '@/stores/project';
import { moduleStorage } from '@/utils/storage';
import { getMMLiteDoNotRemindKey } from '@/utils/mmlite';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/plugins/fb', () => ({
  initFacebookSdk: vi.fn(),
}));

vi.mock('@/utils/env', () => ({
  default: vi.fn(),
}));

describe('components/modals/ActivateMMLiteModal', () => {
  const DEFAULT_PROJECT_UUID = 'proj-123';

  const STUBS = {
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
      template: '<div data-test="modal"><slot /></div>',
    },
    UnnnicCheckbox: {
      name: 'UnnnicCheckbox',
      props: ['modelValue', 'textRight', 'size'],
      emits: ['update:modelValue'],
      template:
        '<input data-test="checkbox" type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    },
    I18nT: {
      name: 'I18nT',
      props: ['keypath', 'tag'],
      template: '<component :is="tag"><slot /></component>',
    },
  } as const;

  const mountModal = (options?: { modelValue?: boolean; projectUuid?: string }) => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const projectStore = useProjectStore(pinia);
    projectStore.project.uuid = options?.projectUuid ?? DEFAULT_PROJECT_UUID;

    return shallowMount(ActivateMMLiteModal, {
      props: {
        modelValue: options?.modelValue ?? true,
      },
      global: {
        plugins: [pinia],
        stubs: STUBS,
        mocks: {
          $t: (k: string) => k,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    const storageKey = getMMLiteDoNotRemindKey(DEFAULT_PROJECT_UUID);
    moduleStorage.removeItem(storageKey);
  });

  it('emits update:modelValue when modal value changes', async () => {
    const wrapper = mountModal();
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('update:model-value', false);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('emits update:modelValue false on secondary button click', async () => {
    const wrapper = mountModal();
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('secondary-button-click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('saves do not remind preference when checkbox is checked and secondary button clicked', async () => {
    const projectUuid = 'proj-456';
    const storageKey = getMMLiteDoNotRemindKey(projectUuid);

    const wrapper = mountModal({ projectUuid });

    const checkbox = wrapper.find('[data-test="checkbox"]');
    await checkbox.setValue(true);

    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('secondary-button-click');

    expect(moduleStorage.getItem(storageKey)).toBe(true);

    moduleStorage.removeItem(storageKey);
  });

  it('does not save do not remind preference when checkbox is not checked', async () => {
    const projectUuid = 'proj-789';
    const storageKey = getMMLiteDoNotRemindKey(projectUuid);

    const wrapper = mountModal({ projectUuid });

    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('secondary-button-click');

    expect(moduleStorage.getItem(storageKey)).toBeNull();
  });

  it('uses project-specific storage key', async () => {
    const projectUuidA = 'proj-a';
    const projectUuidB = 'proj-b';
    const storageKeyA = getMMLiteDoNotRemindKey(projectUuidA);
    const storageKeyB = getMMLiteDoNotRemindKey(projectUuidB);

    const wrapperA = mountModal({ projectUuid: projectUuidA });

    const checkboxA = wrapperA.find('[data-test="checkbox"]');
    await checkboxA.setValue(true);

    const modalA = wrapperA.findComponent({ name: 'UnnnicModalDialog' });
    await modalA.vm.$emit('secondary-button-click');

    expect(moduleStorage.getItem(storageKeyA)).toBe(true);
    expect(moduleStorage.getItem(storageKeyB)).toBeNull();

    moduleStorage.removeItem(storageKeyA);
  });
});
