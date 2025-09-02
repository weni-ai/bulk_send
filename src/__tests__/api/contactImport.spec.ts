import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ContactImport from '@/api/resources/contactImport';
import requests from '@/api/requests';
import { createPinia, setActivePinia } from 'pinia';
import { useProjectStore } from '@/stores/project';

describe('api/resources/contactImport', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    const projectStore = useProjectStore();
    projectStore.setProjectUuid('proj-abc');
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uploadContactImport appends project_uuid and posts form data', async () => {
    const httpPost = (requests as any).$http.post as ReturnType<typeof vi.fn>;
    httpPost.mockResolvedValue({ data: { ok: true } });

    const formData = new FormData();
    formData.append('file', new File(['x'], 'x.csv'));

    const result = await ContactImport.uploadContactImport(formData);

    expect(httpPost).toHaveBeenCalledWith(
      '/api/v2/internals/contacts_import_upload',
      expect.any(FormData),
    );

    const passedFormData = httpPost.mock.calls[0][1] as FormData;
    expect(passedFormData.get('project_uuid')).toBe('proj-abc');
    expect(passedFormData.get('file')).toBeInstanceOf(File);
    expect(result).toEqual({ data: { ok: true } });
  });

  it('confirmContactImport posts mapped data to confirm endpoint', async () => {
    const httpPost = (requests as any).$http.post as ReturnType<typeof vi.fn>;
    httpPost.mockResolvedValue({ data: { ok: true } });

    const result = await ContactImport.confirmContactImport('proj-xyz', 7, {
      addToGroup: true,
      groupMode: 'N' as any,
      groupName: 'New Group',
      columnsData: { column_0_include: true },
    } as any);

    expect(httpPost).toHaveBeenCalledWith(
      '/api/v2/internals/contacts_import_confirm/7/',
      expect.objectContaining({
        project_uuid: 'proj-xyz',
        add_to_group: true,
        group_mode: 'N',
        new_group_name: 'New Group',
        existing_group: null,
        column_0_include: true,
      }),
    );
    expect(result).toEqual({ data: { ok: true } });
  });
});
