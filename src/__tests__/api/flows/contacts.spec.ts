import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Contacts from '@/api/resources/flows/contacts';
import requests from '@/api/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/flows/contacts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const projectStore = useProjectStore();
    projectStore.setProjectUuid('proj-abc');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /contacts_fields with project uuid', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { results: [] } });

    const result = await Contacts.getContactFields();

    expect(httpGet).toHaveBeenCalledWith('/api/v2/internals/contacts_fields', {
      params: { project: 'proj-abc' },
    });
    expect(result).toEqual({ data: { results: [] } });
  });

  it('calls GET /groups_contact_fields with project uuid and comma-joined group ids', async () => {
    const httpGet = (requests as any).$http.get as ReturnType<typeof vi.fn>;
    httpGet.mockResolvedValue({ data: { results: [] } });

    const groups = [
      { id: 10, uuid: 'g10', name: 'G10', memberCount: 1 },
      { id: 2, uuid: 'g2', name: 'G2', memberCount: 3 },
    ] as any;

    const result = await Contacts.getContactFieldsExamplesByGroups(groups);

    expect(httpGet).toHaveBeenCalledWith(
      '/api/v2/internals/groups_contact_fields',
      { params: { project_uuid: 'proj-abc', group_ids: '10,2' } },
    );
    expect(result).toEqual({ data: { results: [] } });
  });
});
