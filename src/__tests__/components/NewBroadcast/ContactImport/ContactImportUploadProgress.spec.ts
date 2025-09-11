import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactImportUploadProgress from '@/components/NewBroadcast/ContactImport/ContactImportUploadProgress.vue';

const STUBS = {
  UnnnicProgressBar: {
    name: 'UnnnicProgressBar',
    props: ['modelValue'],
    template: '<div data-test="progress-bar">{{ modelValue }}</div>',
  },
  UnnnicIcon: {
    name: 'UnnnicIcon',
    props: ['icon', 'size'],
    template: '<div data-test="icon"></div>',
  },
} as const;

const SELECTOR = {
  loading: '[data-test="upload-progress-loading"]',
  cancel: '[data-test="upload-progress-cancel"]',
  fileName: 'h1.contact-import-upload-progress__file-name',
  fileSize: 'p.contact-import-upload-progress__file-size',
  progressBar: '[data-test="progress-bar"]',
} as const;

const mountWrapper = (
  props?: Partial<{
    fileName: string;
    fileSize: string;
    uploadProgress: number;
    loading: boolean;
  }>,
) => {
  return mount(ContactImportUploadProgress, {
    props: {
      fileName: props?.fileName ?? 'contacts.csv',
      fileSize: props?.fileSize ?? String(1024 * 1024 * 5),
      uploadProgress: props?.uploadProgress ?? 37,
      loading: props?.loading ?? false,
    },
    global: { stubs: STUBS },
  });
};

describe('ContactImportUploadProgress.vue', () => {
  it('renders loading state when loading=true', () => {
    const wrapper = mountWrapper({ loading: true });
    expect(wrapper.find(SELECTOR.loading).exists()).toBe(true);
  });

  it('shows file name and size when not loading', () => {
    const wrapper = mountWrapper({
      fileName: 'my.csv',
      fileSize: String(2 * 1024 * 1024),
    });
    expect(wrapper.find(SELECTOR.fileName).text()).toBe('my.csv');
    expect(wrapper.find(SELECTOR.fileSize).text()).toBe('2.00MB');
  });

  it('forwards uploadProgress to UnnnicProgressBar', () => {
    const wrapper = mountWrapper({ uploadProgress: 73 });
    expect(wrapper.find(SELECTOR.progressBar).text()).toContain('73');
  });

  it('emits close when cancel icon is clicked', async () => {
    const wrapper = mountWrapper();
    await wrapper.find(SELECTOR.cancel).trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
