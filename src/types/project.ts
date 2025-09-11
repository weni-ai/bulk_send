import type { Channel } from '@/types/channel';

interface Project {
  uuid: string;
  brainOn: boolean;
  channels: Channel[];
}

export type { Project };
