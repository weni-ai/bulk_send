import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useContactImportStore } from '@/stores/contactImport';
import ContactImportAPI from '@/api/resources/contactImport';
import { AxiosError, type AxiosResponse } from 'axios';
import {
  ContactImportGroupMode,
  ContactImportStatus,
} from '@/types/contactImport';

vi.mock('@/api/resources/contactImport', () => ({
  default: {
    uploadContactImport: vi.fn(),
    confirmContactImport: vi.fn(),
    getContactImport: vi.fn(),
  },
}));

describe('contactImport store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('uploadContactImport sets loading, stores import and unsets loading', async () => {
    const store = useContactImportStore();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    mocked.uploadContactImport.mockResolvedValue({
      data: {
        importId: 1,
        numRecords: 2,
        columns: [],
        fields: [],
        errors: [],
        duplicatedContactsCount: 0,
      },
    } as AxiosResponse);

    expect(store.loadingContactImport).toBe(false);
    const promise = store.uploadContactImport(file);
    expect(store.loadingContactImport).toBe(true);
    await promise;

    expect(mocked.uploadContactImport).toHaveBeenCalled();
    expect(store.import?.importId).toBe(1);
    expect(store.import?.file).toBe(file);
    expect(store.loadingContactImport).toBe(false);
  });

  it('uploadContactImport forwards onUploadProgress and uses AbortSignal', async () => {
    const store = useContactImportStore();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    mocked.uploadContactImport.mockResolvedValue({
      data: {
        importId: 3,
        numRecords: 2,
        columns: [],
        fields: [],
        errors: [],
        duplicatedContactsCount: 0,
      },
    } as AxiosResponse);

    const onUploadProgress = vi.fn();
    const promise = store.uploadContactImport(file, onUploadProgress);

    expect(mocked.uploadContactImport).toHaveBeenCalledWith(
      expect.any(FormData),
      onUploadProgress,
      expect.any(AbortSignal),
    );
    const passedSignal = mocked.uploadContactImport.mock
      .calls[0][2] as AbortSignal;
    expect(passedSignal.aborted).toBe(false);

    await promise;
  });

  it('cancelUpload aborts controller and resets it', () => {
    const store = useContactImportStore();
    store.abortController = new AbortController();
    const abortSpy = vi.spyOn(store.abortController, 'abort');

    store.cancelUpload();

    expect(abortSpy).toHaveBeenCalled();
    expect(store.abortController).toBeUndefined();
  });

  it('second upload aborts previous in-flight request', async () => {
    const store = useContactImportStore();
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;

    const createDeferred = () => {
      let resolve!: (value: AxiosResponse) => void;
      const promise = new Promise<AxiosResponse>((res) => {
        resolve = res;
      });
      return { promise, resolve };
    };

    const first = createDeferred();
    const second = createDeferred();
    mocked.uploadContactImport
      .mockReturnValueOnce(first.promise as any)
      .mockReturnValueOnce(second.promise as any);

    const file1 = new File(['a'], 'a.csv', { type: 'text/csv' });
    const file2 = new File(['b'], 'b.csv', { type: 'text/csv' });

    const p1 = store.uploadContactImport(file1);
    const firstSignal = mocked.uploadContactImport.mock
      .calls[0][2] as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    const p2 = store.uploadContactImport(file2);
    expect(firstSignal.aborted).toBe(true);

    first.resolve({
      data: {
        importId: 1,
        numRecords: 1,
        columns: [],
        fields: [],
        errors: [],
        duplicatedContactsCount: 0,
      },
    } as AxiosResponse);
    second.resolve({
      data: {
        importId: 2,
        numRecords: 2,
        columns: [],
        fields: [],
        errors: [],
        duplicatedContactsCount: 0,
      },
    } as AxiosResponse);

    await Promise.all([p1, p2]);
  });

  it('uploadContactImport throws parsed error on AxiosError and unsets loading', async () => {
    const store = useContactImportStore();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;

    const axiosError = new AxiosError('upload failed');
    (axiosError as any).response = {
      data: { error: "['Bad file']" },
    } as AxiosResponse;
    mocked.uploadContactImport.mockRejectedValue(axiosError);

    expect.assertions(3);
    try {
      await store.uploadContactImport(file);
    } catch (e: any) {
      expect(e.message).toBe('Bad file');
      expect(store.loadingContactImport).toBe(false);
      expect(store.import).toBeUndefined();
    }
  });

  it('uploadContactImport throws when API returns no data and unsets loading', async () => {
    const store = useContactImportStore();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    mocked.uploadContactImport.mockResolvedValue({ data: undefined } as any);

    expect.assertions(2);
    try {
      await store.uploadContactImport(file);
    } catch (e: any) {
      expect(e.message).toBe('Error while uploading contact import');
      expect(store.loadingContactImport).toBe(false);
    }
  });

  it('uploadContactImport rethrows non-AxiosError and unsets loading', async () => {
    const store = useContactImportStore();
    const file = new File(['id,name'], 'contacts.csv', { type: 'text/csv' });
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    const genericError = new Error('generic');
    mocked.uploadContactImport.mockRejectedValue(genericError);

    expect.assertions(2);
    try {
      await store.uploadContactImport(file);
    } catch (e: any) {
      expect(e).toBe(genericError);
      expect(store.loadingContactImport).toBe(false);
    }
  });

  it('confirmContactImport toggles loading flag and calls API', async () => {
    const store = useContactImportStore();
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    mocked.confirmContactImport.mockResolvedValue({
      data: {},
    } as AxiosResponse);

    expect(store.loadingConfirmContactImport).toBe(false);
    const promise = store.confirmContactImport('proj-1', 9, {
      groupMode: ContactImportGroupMode.NEW,
      addToGroup: true,
      columnsData: {},
    } as any);
    expect(store.loadingConfirmContactImport).toBe(true);
    await promise;

    expect(mocked.confirmContactImport).toHaveBeenCalledWith(
      'proj-1',
      9,
      expect.any(Object),
    );
    expect(store.loadingConfirmContactImport).toBe(false);
  });

  it('confirmContactImport catches error and still unsets loading', async () => {
    const store = useContactImportStore();
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocked.confirmContactImport.mockRejectedValue(new Error('fail'));

    expect(store.loadingConfirmContactImport).toBe(false);
    const promise = store.confirmContactImport('proj-1', 9, {
      groupMode: ContactImportGroupMode.NEW,
      addToGroup: true,
      columnsData: {},
    } as any);
    expect(store.loadingConfirmContactImport).toBe(true);
    await promise;

    expect(consoleSpy).toHaveBeenCalled();
    expect(store.loadingConfirmContactImport).toBe(false);
    consoleSpy.mockRestore();
  });

  it('getImportInfo updates contactImportInfo', async () => {
    const store = useContactImportStore();
    const mocked = ContactImportAPI as Mocked<typeof ContactImportAPI>;
    mocked.getContactImport.mockResolvedValue({
      data: {
        info: {
          status: ContactImportStatus.COMPLETE,
          numCreated: 5,
          numUpdated: 1,
          numErrored: 0,
          errors: [],
          timeTaken: 12,
        },
        group: {
          id: 1,
          uuid: 'g',
          name: 'G',
          memberCount: 1,
        },
      },
    } as AxiosResponse);

    await store.getImportInfo(7);

    expect(store.contactImportInfo).toEqual({
      status: ContactImportStatus.COMPLETE,
      numCreated: 5,
      numUpdated: 1,
      numErrored: 0,
      errors: [],
      timeTaken: 12,
    });
    expect(store.contactImportGroup).toEqual({
      id: 1,
      uuid: 'g',
      name: 'G',
      memberCount: 1,
    });
  });

  it('setters update importProcessing fields', () => {
    const store = useContactImportStore();
    store.setProcessingGroupMode(ContactImportGroupMode.EXISTING);
    store.setProcessingGroupName('My Group');
    store.setProcessingGroup({
      id: 1,
      uuid: 'g',
      name: 'G',
      memberCount: 1,
    } as any);
    store.setProcessingAddToGroup(false);
    store.setProcessingColumnsData({ a: 1 } as any);

    expect(store.importProcessing.groupMode).toBe(
      ContactImportGroupMode.EXISTING,
    );
    expect(store.importProcessing.groupName).toBe('My Group');
    expect(store.importProcessing.group?.id).toBe(1);
    expect(store.importProcessing.addToGroup).toBe(false);
    expect(store.importProcessing.columnsData).toEqual({ a: 1 });
  });

  it('clearImport resets import and importProcessing to defaults', () => {
    const store = useContactImportStore();
    store.import = {
      importId: 1,
      numRecords: 1,
      columns: [],
      fields: [],
      errors: [],
      file: new File(['x'], 'x.csv', { type: 'text/csv' }),
      duplicatedContactsCount: 0,
    } as any;
    store.importProcessing.groupName = 'foo';
    store.importProcessing.addToGroup = false;
    store.importProcessing.groupMode = ContactImportGroupMode.EXISTING;
    store.importProcessing.columnsData = { a: 1 } as any;

    store.clearImport();
    expect(store.import).toBeUndefined();
    expect(store.importProcessing.groupName).toBe('');
    expect(store.importProcessing.addToGroup).toBe(true);
    expect(store.importProcessing.groupMode).toBe(ContactImportGroupMode.NEW);
    expect(store.importProcessing.columnsData).toEqual({});
  });
});
