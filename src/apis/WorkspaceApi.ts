import type {
  ConfirmInvitations,
  CreateWorkspaceForm,
  CreateInvitationForm,
  Invitations,
  Workspace,
} from "@/models/UserWorkspace";
import { api } from "@/apis/axios";

const baseUrl = "/workspace";

export const exitWorkspaceApi = (id: number) =>
  api.delete(`${baseUrl}/${id}`).then((response) => response.data);

export const removeWorkspaceMemberApi = (workspaceId: number, userId: number) =>
  api
    .delete(`${baseUrl}/${workspaceId}/members/${userId}`)
    .then((response) => response.data);

export const addWorkspaceApi = (workspace: CreateWorkspaceForm) =>
  api.post(baseUrl, workspace).then((response) => response.data);

export const addInvitationWorkspaceApi = (invitation: CreateInvitationForm) =>
  api
    .post(`${baseUrl}/${invitation.workspaceId}/invitations`, invitation)
    .then((response) => response.data);

export const getAllWorkspaceInvitations = () =>
  api.get<Invitations[]>(`${baseUrl}/invitations`).then((response) => response.data);

export const acceptRejectWorkspaceInvitationApi = (
  confirmInvitations: ConfirmInvitations,
) =>
  api
    .patch(`${baseUrl}/invitations/${confirmInvitations.id}`, confirmInvitations)
    .then((response) => response.data);

export const getAllUserWorkspaces = () =>
  api.get<Workspace[]>(baseUrl).then((response) => response.data);
