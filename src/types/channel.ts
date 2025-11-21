interface Channel {
  uuid: string;
  name: string;
  channelType: string;
  appUuid: string;
  MMLite?: boolean;
  waba?: string;
  phoneNumber?: string;
}

export type { Channel };
