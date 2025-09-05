import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';
import type { Template } from '@/types/template';
import { TemplateStatus } from '@/constants/templates';

const SELECTOR = {
  title: '[data-test="template-preview-title"]',
  name: '[data-test="template-preview-name"]',
  nameValue: '[data-test="template-preview-name-value"]',
  content: '[data-test="template-preview-content"]',
  missing: '[data-test="template-preview-missing"]',
  preview: '[data-test="template-preview-component"]',
} as const;

const stubs = {
  UnnnicTemplatePreview: {
    props: ['template'],
    // Expose mapped template data via attributes for assertions
    template:
      '<div\n' +
      '  data-test="template-preview-component"\n' +
      '  :data-header-type="template?.header?.type || ""\n' +
      '  :data-media-type="template?.header?.mediaType || ""\n' +
      '  :data-body="template?.body || ""\n' +
      '  :data-footer="template?.footer || ""\n' +
      '/>',
  },
};

const mountWithStore = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);
  const wrapper = mount(TemplateSelectionPreview, {
    global: {
      plugins: [pinia],
      stubs,
      mocks: { $t: (key: string) => key },
    },
  });
  return { wrapper, broadcastsStore };
};

describe('TemplateSelectionPreview.vue', () => {
  it('renders empty state when no template selected', () => {
    const { wrapper } = mountWithStore();
    expect(wrapper.find(SELECTOR.title).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.missing).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.name).exists()).toBe(false);
    expect(wrapper.find(SELECTOR.preview).exists()).toBe(false);
  });

  it('renders preview with mapped template when a template is selected', () => {
    const { wrapper, broadcastsStore } = mountWithStore();

    const template: Template = {
      uuid: 't-1',
      name: 'Welcome Msg',
      createdOn: '2024-01-01T00:00:00Z',
      category: 'MARKETING',
      language: 'en',
      header: { type: 'IMAGE' }, // should be mapped to MEDIA with mediaType IMAGE
      body: { text: 'Hello, world!' },
      footer: { text: 'Bye' },
      buttons: [{ type: 'TEXT', text: 'OK' }],
      status: TemplateStatus.APPROVED,
    };

    broadcastsStore.setSelectedTemplate(template);

    // name and preview should render
    expect(wrapper.find(SELECTOR.name).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.nameValue).text()).toBe('Welcome Msg');
    const preview = wrapper.find(SELECTOR.preview);
    expect(preview.exists()).toBe(true);

    // header mapping assertions
    expect(preview.attributes('data-header-type')).toBe('MEDIA');
    expect(preview.attributes('data-media-type')).toBe('IMAGE');
    // body/footer mapping assertions
    expect(preview.attributes('data-body')).toBe('Hello, world!');
    expect(preview.attributes('data-footer')).toBe('Bye');
  });
});
