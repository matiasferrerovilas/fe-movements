import type { User } from "./User";

export interface AccountWithoutMembers {
  id: number;
  name: string;
}
export interface AccountWithMembers {
  id: number;
  name: string;
  owner: User;
  members: AccountMember[];
}

export interface Membership {
  accountId: number;
  membershipId: number;
  groupDescription: string;
  role: string;
}

export interface AccountMember {
  id: number;
  user: User;
  role: string;
}

export interface GroupDetail {
  id: number;
  name: string;
  membersCount: number;
  isDefault: boolean;
}

export interface CreateGroupForm {
  description: string;
}

export interface CreateInvitationForm {
  emails: string[];
  groupId: number;
}

export interface Invitations {
  id: number;
  nameAccount: string;
  invitedBy: string;
}

export interface ConfirmInvitations {
  status: boolean;
  id: number;
}
