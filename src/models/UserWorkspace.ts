import type { User } from "@/models/User";
import type { InvitationStatusEnum } from "@/enums/InvitationStatusEnum";
import type { WorkspaceRoleEnum } from "@/enums/WorkspaceRoleEnum";

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

export interface WorkspaceMemberDetail {
  userId: number;
  email: string;
  role: string;
}

export interface WorkspaceMetadata {
  memberDetails: WorkspaceMemberDetail[];
  role: string;
  joinedAt: string;
  isDefault: boolean;
}

export interface Workspace {
  id: number;
  workspaceId: number;
  workspaceName: string;
  metadata: WorkspaceMetadata;
}

export interface AccountMember {
  id: number;
  user: User;
  role: string;
}

export interface CreateWorkspaceForm {
  description: string;
}

export interface CreateInvitationForm {
  emails: string[];
  workspaceId: number;
  // Rol con el que se une el invitado si acepta — api-identity lo setea en el membership recién
  // en ese momento (ver WorkspaceMembershipService.addMembership).
  role: WorkspaceRoleEnum;
}

export interface Invitations {
  id: number;
  workspaceId: number;
  workspaceName: string;
  invitedByEmail: string;
  status: InvitationStatusEnum;
  role: WorkspaceRoleEnum;
  createdAt: string;
}

export interface SentInvitation {
  id: number;
  workspaceId: number;
  workspaceName: string;
  invitedUserEmail: string;
  status: InvitationStatusEnum;
  role: WorkspaceRoleEnum;
  createdAt: string;
}

export interface ConfirmInvitations {
  status: boolean;
  id: number;
}
