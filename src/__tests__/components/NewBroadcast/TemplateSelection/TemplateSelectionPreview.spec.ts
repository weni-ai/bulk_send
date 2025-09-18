import { describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TemplateSelectionPreview from '@/components/NewBroadcast/TemplateSelection/TemplateSelectionPreview.vue';
import { useBroadcastsStore } from '@/stores/broadcasts';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const STUBS = {
  UnnnicTemplatePreview: {
    props: ['template'],
    template:
      '<div\n' +
      '  data-test="template-preview-component"\n' +
      "  :data-header-type=\"template && template.header ? (template.header.type || '' ) : ''\"\n" +
      "  :data-media-type=\"template && template.header ? (template.header.mediaType || '' ) : ''\"\n" +
      '  :data-body="template && template.body ? template.body : \'\'"\n' +
      '  :data-footer="template && template.footer ? template.footer : \'\'"\n' +
      '/>',
  },
} as const;

const SELECTOR = {
  root: '[data-test="template-preview"]',
  header: '[data-test="template-preview-header"]',
  title: '[data-test="template-preview-title"]',
  name: '[data-test="template-preview-name"]',
  nameValue: '[data-test="template-preview-name-value"]',
  content: '[data-test="template-preview-content"]',
  missing: '[data-test="template-preview-missing"]',
  previewComponent: '[data-test="template-preview-component"]',
} as const;

const mountWrapper = (opts?: {
  withTemplate?: boolean;
  variables?: (string | undefined)[];
}) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const broadcastsStore = useBroadcastsStore(pinia);

  if (opts?.withTemplate) {
    broadcastsStore.newBroadcast.selectedTemplate = {
      name: 'Welcome',
      body: { text: 'Hello {{1}} and {{2}}' },
      footer: { text: 'Footer' },
      header: { type: 'TEXT', text: 'Header' },
      buttons: [],
    } as any;
  } else {
    broadcastsStore.newBroadcast.selectedTemplate = undefined;
  }

  const wrapper = mount(TemplateSelectionPreview, {
    props: { variablesToReplace: opts?.variables },
    global: { plugins: [pinia], stubs: STUBS, mocks: { $t: (k: string) => k } },
  });
  return { wrapper, broadcastsStore };
};

describe('TemplateSelectionPreview.vue', () => {
  it('renders title and missing state when no template selected', () => {
    const { wrapper } = mountWrapper({ withTemplate: false });
    expect(wrapper.find(SELECTOR.title).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.missing).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.previewComponent).exists()).toBe(false);
  });

  it('renders name and UnnnicTemplatePreview when template selected', () => {
    const { wrapper } = mountWrapper({ withTemplate: true });
    expect(wrapper.find(SELECTOR.name).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.nameValue).text()).toBe('Welcome');
    expect(wrapper.find(SELECTOR.previewComponent).exists()).toBe(true);
  });

  it('formats body to bold placeholders and replaces with variables', () => {
    const { wrapper } = mountWrapper({
      withTemplate: true,
      variables: ['Alice', undefined],
    });

    const bodyText = wrapper
      .find(SELECTOR.previewComponent)
      .attributes('data-body');
    // {{1}} becomes bold style marker *{{1}}* then replaced with Alice
    expect(bodyText).toContain('Hello *Alice* and *{{2}}*');
  });

  it('maps non-TEXT header to MEDIA, keeps mediaType, and includes footer', async () => {
    const { wrapper, broadcastsStore } = mountWrapper({ withTemplate: false });

    broadcastsStore.setSelectedTemplate({
      name: 'Welcome Msg',
      header: { type: 'IMAGE' },
      body: { text: 'Hello' },
      footer: { text: 'Bye' },
      buttons: [],
    } as any);

    await nextTick();

    const preview = wrapper.find(SELECTOR.previewComponent);
    expect(preview.exists()).toBe(true);
    expect(preview.attributes('data-header-type')).toBe('MEDIA');
    expect(preview.attributes('data-media-type')).toBe('IMAGE');
    expect(preview.attributes('data-footer')).toBe('Bye');
  });
});
