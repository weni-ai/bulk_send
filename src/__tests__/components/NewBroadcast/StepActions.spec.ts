import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import StepActions from '@/components/NewBroadcast/StepActions.vue';

// i18n stub
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const STUBS = {
  UnnnicButton: {
    props: ['type', 'disabled'],
    emits: ['click'],
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
} as const;

const SELECTOR = {
  cancel: '[data-test="actions-cancel"]',
  cont: '[data-test="actions-continue"]',
  // buttons are identified by their data-test on StepActions itself
  // because stub root inherits attrs from usage site
} as const;

describe('StepActions.vue', () => {
  it('emits cancel and continue events when clicked', async () => {
    const wrapper = mount(StepActions, {
      global: { stubs: STUBS, mocks: { $t: (k: string) => k } },
    });

    await wrapper.find(SELECTOR.cancel).trigger('click');
    await wrapper.find(SELECTOR.cont).trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.emitted('continue')).toBeTruthy();
  });

  it('disables continue button based on prop', async () => {
    const wrapper = mount(StepActions, {
      props: { disabled: true },
      global: { stubs: STUBS, mocks: { $t: (k: string) => k } },
    });

    const continueBtn = wrapper.find(SELECTOR.cont);
    expect(continueBtn.attributes('disabled')).not.toBeUndefined();
  });
});
