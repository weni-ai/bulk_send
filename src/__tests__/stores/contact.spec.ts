import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useContactStore } from '@/stores/contact';
import ContactsAPI from '@/api/resources/contacts';
import type { AxiosResponse } from 'axios';

vi.mock('@/api/resources/contacts', () => ({
  default: {
    getContactFields: vi.fn(),
    getContactFieldsExamplesByGroups: vi.fn(),
  },
}));

describe('contact store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchContactFields toggles loading and stores results', async () => {
    const store = useContactStore();
    const mocked = ContactsAPI as Mocked<typeof ContactsAPI>;
    const results = [{ key: 'name' }, { key: 'age' }];
    mocked.getContactFields.mockResolvedValue({
      data: { results },
    } as AxiosResponse);

    expect(store.loadingContactFields).toBe(false);
    const promise = store.fetchContactFields();
    expect(store.loadingContactFields).toBe(true);
    await promise;

    expect(mocked.getContactFields).toHaveBeenCalled();
    expect(store.contactFields).toEqual(results);
    expect(store.loadingContactFields).toBe(false);
  });

  it('fetchContactFields handles error and unsets loading', async () => {
    const store = useContactStore();
    const mocked = ContactsAPI as Mocked<typeof ContactsAPI>;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocked.getContactFields.mockRejectedValue(new Error('fail'));

    expect(store.loadingContactFields).toBe(false);
    await store.fetchContactFields();
    expect(consoleSpy).toHaveBeenCalled();
    expect(store.loadingContactFields).toBe(false);
    expect(store.contactFields).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('getContactFieldsExamplesByGroups toggles loading and stores results', async () => {
    const store = useContactStore();
    const mocked = ContactsAPI as Mocked<typeof ContactsAPI>;
    const results = [{ key: 'name', example: 'Alice' }];
    mocked.getContactFieldsExamplesByGroups.mockResolvedValue({
      data: { results },
    } as AxiosResponse);

    const groups = [
      { id: 1, uuid: 'g1', name: 'G1', memberCount: 10 },
      { id: 2, uuid: 'g2', name: 'G2', memberCount: 5 },
    ] as any;

    expect(store.loadingContactFieldsExamples).toBe(false);
    const promise = store.getContactFieldsExamplesByGroups(groups);
    expect(store.loadingContactFieldsExamples).toBe(true);
    await promise;

    expect(mocked.getContactFieldsExamplesByGroups).toHaveBeenCalledWith(
      groups,
    );
    expect(store.contactFieldsExamples).toEqual(results);
    expect(store.loadingContactFieldsExamples).toBe(false);
  });

  it('getContactFieldsExamplesByGroups handles error and unsets loading', async () => {
    const store = useContactStore();
    const mocked = ContactsAPI as Mocked<typeof ContactsAPI>;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocked.getContactFieldsExamplesByGroups.mockRejectedValue(
      new Error('fail'),
    );

    const groups = [{ id: 1, uuid: 'g1', name: 'G1', memberCount: 10 }] as any;

    expect(store.loadingContactFieldsExamples).toBe(false);
    await store.getContactFieldsExamplesByGroups(groups);
    expect(consoleSpy).toHaveBeenCalled();
    expect(store.loadingContactFieldsExamples).toBe(false);
    expect(store.contactFieldsExamples).toEqual([]);
    consoleSpy.mockRestore();
  });
});
