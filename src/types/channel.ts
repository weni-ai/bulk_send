interface Channel {
  uuid: string;
  name: string;
  channelType: string;
  MMLite?: boolean;
  waba?: string;
  phoneNumber?: string;
}

export type { Channel };
