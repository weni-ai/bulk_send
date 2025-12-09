import { MMLITE_DO_NOT_REMIND_KEY } from '@/constants/storage';

export const getMMLiteDoNotRemindKey = (projectUuid: string) =>
  `${MMLITE_DO_NOT_REMIND_KEY}_${projectUuid}`;
