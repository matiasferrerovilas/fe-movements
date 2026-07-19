import type { User } from "@/models/User";
import type { InvitationStatusEnum } from "@/enums/InvitationStatusEnum";

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

export interface WorkspaceMetadata {
  members: string[];
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
}

export interface Invitations {
  id: number;
  workspaceId: number;
  workspaceName: string;
  invitedByEmail: string;
  status: InvitationStatusEnum;
  createdAt: string;
}

export interface ConfirmInvitations {
  status: boolean;
  id: number;
}
