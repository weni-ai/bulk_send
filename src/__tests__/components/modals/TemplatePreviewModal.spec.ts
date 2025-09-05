import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TemplatePreviewModal from '@/components/modals/TemplatePreviewModal.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

let mockGetTemplate: any;
vi.mock('@/stores/templates', () => ({
  useTemplatesStore: () => ({ getTemplate: mockGetTemplate }),
}));

const STUBS = {
  UnnnicModalDialog: {
    props: ['modelValue', 'title', 'showCloseIcon', 'showActionsDivider'],
    emits: ['update:model-value'],
    template:
      '<div data-test="modal" :data-open="modelValue"><slot /><button data-test="close" @click="$emit(\'update:model-value\', false)"></button></div>',
  },
  UnnnicTemplatePreview: {
    props: ['template'],
    template:
      '<div\n' +
      '  data-test="preview"\n' +
      "  :data-header-type=\"template && template.header ? (template.header.type || '' ) : ''\"\n" +
      "  :data-media-type=\"template && template.header ? (template.header.mediaType || '' ) : ''\"\n" +
      '  :data-body="template && template.body ? template.body : \'\'"\n' +
      '  :data-footer="template && template.footer ? template.footer : \'\'"\n' +
      '/>',
  },
} as const;

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('TemplatePreviewModal.vue', () => {
  beforeEach(() => {
    mockGetTemplate = vi.fn();
  });

  it('shows loading then renders preview with mapped template', async () => {
    const deferred = createDeferred<any>();
    mockGetTemplate.mockReturnValue(deferred.promise);

    const wrapper = mount(TemplatePreviewModal, {
      props: { modelValue: true, templateId: 123 },
      global: { stubs: STUBS, mocks: { $t: (k: string) => k } },
    });

    expect(wrapper.find('[data-test="group-list-loading"]').exists()).toBe(
      true,
    );

    // resolve API call
    deferred.resolve({
      data: {
        uuid: 't-1',
        name: 'Welcome',
        createdOn: '2024-01-01T00:00:00Z',
        category: 'CAT',
        language: 'en',
        header: { type: 'IMAGE' },
        body: { text: 'Body' },
        footer: { text: 'Footer' },
        status: 'A',
      },
    });

    // allow then/finally microtasks and DOM update to flush
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    const loading = wrapper.find('[data-test="group-list-loading"]');
    expect(loading.exists()).toBe(false);
    const preview = wrapper.find('[data-test="preview"]');
    expect(preview.exists()).toBe(true);
    expect(preview.attributes('data-header-type')).toBe('MEDIA');
    expect(preview.attributes('data-media-type')).toBe('IMAGE');
    expect(preview.attributes('data-body')).toBe('Body');
    expect(preview.attributes('data-footer')).toBe('Footer');
  });

  it('emits update:modelValue when modal emits update:model-value', async () => {
    mockGetTemplate.mockResolvedValue({ data: { body: { text: '' } } });

    const wrapper = mount(TemplatePreviewModal, {
      props: { modelValue: true, templateId: 1 },
      global: { stubs: STUBS, mocks: { $t: (k: string) => k } },
    });

    await wrapper.find('[data-test="close"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
