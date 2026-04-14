import type {
  WorkspaceDetail,
  ConfirmInvitations,
  CreateWorkspaceForm,
  CreateInvitationForm,
  Invitations,
  Membership,
} from "../models/UserWorkspace";
import { api } from "./axios";

const baseUrl = "/workspace";

export const exitWorkspaceApi = (id: number) =>
  api.delete(`${baseUrl}/${id}`).then((response) => response.data);

export const addWorkspaceApi = (workspace: CreateWorkspaceForm) =>
  api.post(baseUrl, workspace).then((response) => response.data);

export const setDefaultWorkspaceApi = (id: number) =>
  api.patch(`${baseUrl}/${id}/default`).then((response) => response.data);

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

export const getAllWorkspacesWithUsers = () =>
  api.get<WorkspaceDetail[]>(`${baseUrl}/count`).then((response) => response.data);

export const getAllUserWorkspaces = () =>
  api.get<Membership[]>(`${baseUrl}/membership`).then((response) => response.data);

export const getWorkspaceMembers = () =>
  api.get<string[]>(`${baseUrl}/members`).then((response) => response.data);
