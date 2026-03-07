import type {
  GroupsWithMembers,
  ConfirmInvitations,
  CreateGroupForm,
  CreateInvitationForm,
  Invitations,
  Membership,
} from "../models/UserGroup";
import { api } from "./axios";

const baseUrl = "/account";
export async function exitGroupApi(id: number) {
  return api
    .delete(baseUrl + "/" + id)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error exiting group:", error);
      throw error;
    });
}

export async function addGroupApi(group: CreateGroupForm) {
  return api
    .post(baseUrl, group)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding a group:", error);
      throw error;
    });
}

export const setDefaultGroupApi = (id: number) =>
  api
    .patch(baseUrl + `/${id}/default`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error setting default group:", error);
      throw error;
    });

export async function addInvitationGroupApi(invitation: CreateInvitationForm) {
  return api
    .post(baseUrl + "/" + invitation.groupId + "/invitations", invitation)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding a group:", error);
      throw error;
    });
}

export async function getAllInvitations() {
  return api
    .get<Invitations[]>(baseUrl + "/invitations")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching expenses:", error);
      throw error;
    });
}

export async function acceptRejectGroupInvitationApi(
  confirmInvitations: ConfirmInvitations,
) {
  return api
    .patch(
      baseUrl + "/invitations/" + confirmInvitations.id,
      confirmInvitations,
    )
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding a group:", error);
      throw error;
    });
}

export async function getAllGroupsWithUsers() {
  return api
    .get<GroupsWithMembers[]>(baseUrl + "/count")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching groups count:", error);
      throw error;
    });
}

export async function getAllUserGroups() {
  return api
    .get<Membership[]>(baseUrl + "/membership")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching all groups:", error);
      throw error;
    });
}
