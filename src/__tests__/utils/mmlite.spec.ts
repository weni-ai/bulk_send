import { describe, it, expect } from 'vitest';
import { getMMLiteDoNotRemindKey } from '@/utils/mmlite';
import { MMLITE_DO_NOT_REMIND_KEY } from '@/constants/storage';

describe('MMLite Utils', () => {
  describe('getMMLiteDoNotRemindKey', () => {
    it('should generate a project-specific storage key', () => {
      const projectUuid = 'proj-123';
      const key = getMMLiteDoNotRemindKey(projectUuid);

      expect(key).toBe(`${MMLITE_DO_NOT_REMIND_KEY}_${projectUuid}`);
    });

    it('should generate different keys for different projects', () => {
      const key1 = getMMLiteDoNotRemindKey('project-a');
      const key2 = getMMLiteDoNotRemindKey('project-b');

      expect(key1).not.toBe(key2);
      expect(key1).toBe(`${MMLITE_DO_NOT_REMIND_KEY}_project-a`);
      expect(key2).toBe(`${MMLITE_DO_NOT_REMIND_KEY}_project-b`);
    });
  });
});
