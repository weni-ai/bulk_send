import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactImportUploadInstructions from '@/components/NewBroadcast/ContactImport/ContactImportUploadInstructions.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  I18nT: {
    props: ['keypath', 'tag'],
    template: '<p data-test="i18nt"><slot /></p>',
  },
  ContactImportUploadInstructionsModal: {
    props: ['open'],
    emits: ['update:open'],
    template:
      '<div data-test="instructions-modal" :data-open="open"><button data-test="close" @click="$emit(\'update:open\', false)">close</button></div>',
  },
} as const;

const mountWrapper = (disabled = false) =>
  mount(ContactImportUploadInstructions, {
    props: { disabled },
    global: { stubs: STUBS, mocks: { $t: (key: string) => key } },
  });

const SELECTOR = {
  instructionsModal: '[data-test="instructions-modal"]',
  openModal: '[data-test="open-modal"]',
  close: '[data-test="close"]',
} as const;

describe('ContactImportUploadInstructions.vue', () => {
  it('opens the instructions modal when button is clicked', async () => {
    const wrapper = mountWrapper();
    expect(
      wrapper.find(SELECTOR.instructionsModal).attributes('data-open'),
    ).toBe('false');
    await wrapper.find(SELECTOR.openModal).trigger('click');
    expect(
      wrapper.find(SELECTOR.instructionsModal).attributes('data-open'),
    ).toBe('true');
  });

  it('closes the instructions modal when child emits update:open=false', async () => {
    const wrapper = mountWrapper();
    await wrapper.find(SELECTOR.openModal).trigger('click');
    await wrapper.find(SELECTOR.close).trigger('click');
    expect(
      wrapper.find(SELECTOR.instructionsModal).attributes('data-open'),
    ).toBe('false');
  });

  it('does not open the instructions modal when disabled', async () => {
    const wrapper = mountWrapper(true);
    await wrapper.find(SELECTOR.openModal).trigger('click');
    expect(
      wrapper.find(SELECTOR.instructionsModal).attributes('data-open'),
    ).toBe('false');
  });
});
