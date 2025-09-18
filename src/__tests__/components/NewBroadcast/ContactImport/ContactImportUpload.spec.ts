import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContactImportUpload from '@/components/NewBroadcast/ContactImport/ContactImportUpload.vue';
import { useContactImportStore } from '@/stores/contactImport';
import unnnic from '@weni/unnnic-system';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

const STUBS = {
  I18nT: {
    props: ['keypath', 'tag'],
    template: '<span data-test="i18nt"><slot /></span>',
  },
  UnnnicDropArea: {
    name: 'UnnnicDropArea',
    props: ['currentFiles', 'supportedFormats', 'acceptMultiple', 'disabled'],
    emits: [
      'update:current-files',
      'on-unsupported-format',
      'on-exceeded-the-maximum-file-size-limit',
    ],
    template:
      '<div data-test="drop-area"><slot name="title" /><slot name="subtitle" /></div>',
  },
  ContactImportUploadInstructions: {
    template: '<div data-test="instructions" />',
  },
} as const;

const SELECTOR = {
  dropArea: '[data-test="drop-area"]',
  instructions: '[data-test="instructions"]',
} as const;

const $t = (key: string) => key;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const mountWrapper = (disabled = false) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const contactImportStore = useContactImportStore(pinia);
  const wrapper = mount(ContactImportUpload, {
    props: { disabled },
    global: {
      plugins: [pinia],
      stubs: STUBS,
      mocks: { $t },
    },
  });
  return { wrapper, contactImportStore };
};

describe('ContactImportUpload.vue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders drop area and instructions', () => {
    const { wrapper } = mountWrapper();
    expect(wrapper.find(SELECTOR.dropArea).exists()).toBe(true);
    expect(wrapper.find(SELECTOR.instructions).exists()).toBe(true);
  });

  it('forwards props and supported formats to drop area', () => {
    const { wrapper } = mountWrapper(true);
    const drop = wrapper.findComponent({ name: 'UnnnicDropArea' });
    expect(drop.exists()).toBe(true);
    expect(drop.props('acceptMultiple')).toBe(false);
    expect(drop.props('disabled')).toBe(true);
    expect(drop.props('supportedFormats')).toBe('.csv,.xls,.xlsx');
  });

  it('uploads file successfully and keeps currentFiles', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    const uploadSpy = vi
      .spyOn(contactImportStore, 'uploadContactImport')
      .mockResolvedValue();

    const drop = wrapper.findComponent({ name: 'UnnnicDropArea' });
    drop.vm.$emit('update:current-files', [file]);
    await wrapper.vm.$nextTick();

    expect(uploadSpy).toHaveBeenCalledWith(file);
    expect(
      wrapper.findComponent({ name: 'UnnnicDropArea' }).props('currentFiles'),
    ).toEqual([file]);
  });

  it('shows alert and clears currentFiles on upload error', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    vi.spyOn(contactImportStore, 'uploadContactImport').mockRejectedValue(
      new Error('upload failed'),
    );

    const drop = wrapper.findComponent({ name: 'UnnnicDropArea' });
    drop.vm.$emit('update:current-files', [file]);
    await wrapper.vm.$nextTick();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(unnnic.unnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'error' }),
      }),
    );
    expect(
      wrapper.findComponent({ name: 'UnnnicDropArea' }).props('currentFiles'),
    ).toEqual([]);
  });

  it('logs events for unsupported format and exceeded size', async () => {
    const { wrapper } = mountWrapper();
    const drop = wrapper.findComponent({ name: 'UnnnicDropArea' });
    const callAlertSpy = vi
      .spyOn(unnnic, 'unnnicCallAlert')
      .mockImplementation(() => {});

    const unsupported = new File(['x'], 'file.txt', { type: 'text/plain' });
    drop.vm.$emit('on-unsupported-format', unsupported);
    expect(callAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'error' }),
      }),
    );

    const tooBig = new File(['x'], 'big.csv', { type: 'text/csv' });
    drop.vm.$emit('on-exceeded-the-maximum-file-size-limit', tooBig);
    expect(callAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'error' }),
      }),
    );

    callAlertSpy.mockRestore();
  });
});
