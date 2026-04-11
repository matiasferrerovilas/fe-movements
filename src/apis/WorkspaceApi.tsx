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

export async function exitWorkspaceApi(id: number) {
  return api
    .delete(baseUrl + "/" + id)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error exiting workspace:", error);
      throw error;
    });
}

export async function addWorkspaceApi(workspace: CreateWorkspaceForm) {
  return api
    .post(baseUrl, workspace)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding a workspace:", error);
      throw error;
    });
}

export const setDefaultWorkspaceApi = (id: number) =>
  api
    .patch(baseUrl + `/${id}/default`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error setting default workspace:", error);
      throw error;
    });

export async function addInvitationWorkspaceApi(invitation: CreateInvitationForm) {
  return api
    .post(baseUrl + "/" + invitation.workspaceId + "/invitations", invitation)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding workspace invitation:", error);
      throw error;
    });
}

export async function getAllWorkspaceInvitations() {
  return api
    .get<Invitations[]>(baseUrl + "/invitations")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching workspace invitations:", error);
      throw error;
    });
}

export async function acceptRejectWorkspaceInvitationApi(
  confirmInvitations: ConfirmInvitations,
) {
  return api
    .patch(
      baseUrl + "/invitations/" + confirmInvitations.id,
      confirmInvitations,
    )
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error responding to workspace invitation:", error);
      throw error;
    });
}

export async function getAllWorkspacesWithUsers() {
  return api
    .get<WorkspaceDetail[]>(baseUrl + "/count")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching workspaces count:", error);
      throw error;
    });
}

export async function getAllUserWorkspaces() {
  return api
    .get<Membership[]>(baseUrl + "/membership")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching user workspaces:", error);
      throw error;
    });
}
