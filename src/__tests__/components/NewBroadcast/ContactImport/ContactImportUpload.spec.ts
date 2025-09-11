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
  ContactImportUploadProgress: {
    name: 'ContactImportUploadProgress',
    props: ['fileName', 'fileSize', 'uploadProgress', 'loading'],
    emits: ['close'],
    template:
      '<div data-test="progress"><slot />{{ fileName }}{{ fileSize }}</div>',
  },
} as const;

const SELECTOR = {
  dropArea: '[data-test="drop-area"]',
  instructions: '[data-test="instructions"]',
  progress: '[data-test="progress"]',
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

    expect(uploadSpy).toHaveBeenCalledWith(file, expect.any(Function));
    expect(
      wrapper.findComponent({ name: 'UnnnicDropArea' }).props('currentFiles'),
    ).toEqual([file]);
  });

  it('shows progress component after first progress event and passes props', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    const file = new File(['x'], 'file.csv', { type: 'text/csv' });
    const uploadSpy = vi
      .spyOn(contactImportStore, 'uploadContactImport')
      .mockResolvedValue();

    // Start upload
    wrapper
      .findComponent({ name: 'UnnnicDropArea' })
      .vm.$emit('update:current-files', [file]);
    await wrapper.vm.$nextTick();

    // Trigger progress to flip UI to uploading state
    const onProgress = uploadSpy.mock.calls[0][1] as (e: {
      progress?: number | null;
    }) => void;
    onProgress({ progress: 0.5 });
    await wrapper.vm.$nextTick();

    const progress = wrapper.find(SELECTOR.progress);
    expect(progress.exists()).toBe(true);
    const stub = wrapper.findComponent({ name: 'ContactImportUploadProgress' });
    expect(stub.exists()).toBe(true);
    expect(stub.props('fileName')).toBe('file.csv');
    expect(stub.props('fileSize')).toBe(String(file.size));
    expect(typeof stub.props('uploadProgress')).toBe('number');
    expect(stub.props('loading')).toBe(false);
  });

  it('emits close from progress -> cancels upload and returns to drop area', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    const cancelSpy = vi
      .spyOn(contactImportStore, 'cancelUpload')
      .mockImplementation(() => {});
    const file = new File(['x'], 'file.csv', { type: 'text/csv' });
    vi.spyOn(contactImportStore, 'uploadContactImport').mockResolvedValue();

    // Select file and trigger progress to show progress component
    wrapper
      .findComponent({ name: 'UnnnicDropArea' })
      .vm.$emit('update:current-files', [file]);
    await wrapper.vm.$nextTick();
    const onProgress = (contactImportStore.uploadContactImport as any).mock
      .calls[0][1] as (e: { progress?: number | null }) => void;
    onProgress({ progress: 0.2 });
    await wrapper.vm.$nextTick();

    // Emit close from progress component
    const progress = wrapper.findComponent({
      name: 'ContactImportUploadProgress',
    });
    progress.vm.$emit('close');
    await wrapper.vm.$nextTick();

    expect(cancelSpy).toHaveBeenCalled();
    expect(wrapper.find(SELECTOR.dropArea).exists()).toBe(true);
    // Files cleared
    expect(
      wrapper.findComponent({ name: 'UnnnicDropArea' }).props('currentFiles'),
    ).toEqual([]);
  });

  it('completes upload and emits finished after delay', async () => {
    const { wrapper, contactImportStore } = mountWrapper();
    vi.useFakeTimers();
    const file = new File(['x'], 'file.csv', { type: 'text/csv' });
    const uploadSpy = vi
      .spyOn(contactImportStore, 'uploadContactImport')
      .mockResolvedValue();

    wrapper
      .findComponent({ name: 'UnnnicDropArea' })
      .vm.$emit('update:current-files', [file]);
    await wrapper.vm.$nextTick();
    const onProgress = uploadSpy.mock.calls[0][1] as (e: {
      progress?: number | null;
    }) => void;
    // Reach end of network upload
    onProgress({ progress: 1 });
    await wrapper.vm.$nextTick();

    // Await completion path and timers
    await Promise.resolve();
    vi.advanceTimersByTime(5000);

    expect(wrapper.emitted('finished')).toBeTruthy();
    vi.useRealTimers();
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
