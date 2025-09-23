import { describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ConfirmAndSendAudience from '@/components/NewBroadcast/ConfirmAndSend/ConfirmAndSendAudience.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import { useContactImportStore } from '@/stores/contactImport';
import { useTemplatesStore } from '@/stores/templates';
import { TemplateCategory } from '@/constants/templates';
import { toPercentage } from '@/utils/percentage';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const STUBS = {
  I18nT: {
    props: ['keypath', 'tag'],
    template: '<p data-test="i18nt"><slot /></p>',
  },
} as const;

const SELECTOR = {
  root: '.confirm-and-send-audience',
  items: '[data-test="i18nt"]',
} as const;

const mountWrapper = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const contactImportStore = useContactImportStore(pinia);
  const templatesStore = useTemplatesStore(pinia);

  // default pricing
  templatesStore.templatePricing = {
    currency: 'USD',
    rates: { marketing: 1, utility: 2, authentication: 3, service: 4 },
  } as any;

  const wrapper = mount(ConfirmAndSendAudience, {
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, broadcastsStore, contactImportStore, templatesStore };
};

describe('ConfirmAndSendAudience.vue', () => {
  it('computes groups and contacts from selected groups when no import', async () => {
    const { wrapper, broadcastsStore } = mountWrapper();
    broadcastsStore.newBroadcast.selectedGroups = [
      { id: 1, uuid: 'g1', name: 'G1', memberCount: 10 } as any,
      { id: 2, uuid: 'g2', name: 'G2', memberCount: 5 } as any,
    ];
    broadcastsStore.newBroadcast.selectedTemplate = {
      category: TemplateCategory.MARKETING,
    } as any;
    await nextTick();

    const items = wrapper.findAll(SELECTOR.items);
    expect(items.length).toBeGreaterThan(0);
    // cost = (10+5) * rate(1) = 15.00 (allow locale comma or dot)
    const cost = 15.0;
    const costLocalized = toPercentage(cost);
    expect(wrapper.text()).toMatch(new RegExp(`\\$${costLocalized}`));
  });

  it('uses contact import info when present', async () => {
    const { wrapper, contactImportStore, broadcastsStore } = mountWrapper();
    contactImportStore.import = {
      numRecords: 7,
      file: new File(['x'], 'x.csv', { type: 'text/csv' }),
    } as any;
    contactImportStore.importProcessing.groupName = 'New Group';
    // pick UTILITY rate = 2
    broadcastsStore.newBroadcast.selectedTemplate = {
      category: TemplateCategory.UTILITY,
    } as any;
    await nextTick();

    // cost = 7 * 2 = 14.00 (allow locale comma or dot)
    const cost = 14.0;
    const costLocalized = toPercentage(cost);
    expect(wrapper.text()).toMatch(new RegExp(`\\$${costLocalized}`));
    expect(wrapper.text()).toContain('New Group');
  });
});
