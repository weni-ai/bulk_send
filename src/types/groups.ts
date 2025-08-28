interface GroupReference {
  uuid: string;
  name: string;
}

interface Group extends GroupReference {
  id: number;
  memberCount: number;
}

export type { Group, GroupReference };
