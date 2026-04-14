import { useQuery } from "@tanstack/react-query";
import {
  getAllWorkspacesWithUsers,
  getAllWorkspaceInvitations,
  getAllUserWorkspaces,
  getWorkspaceMembers,
} from "../WorkspaceApi";

const USER_WORKSPACES_COUNT_QUERY_KEY = "workspace-count" as const;
const USER_WORKSPACES_QUERY_KEY = "user-workspaces" as const;
const INVITATIONS_WORKSPACES_QUERY_KEY = "workspace-invitations" as const;
const WORKSPACE_MEMBERS_QUERY_KEY = "workspace-members" as const;

export const useWorkspaces = () =>
  useQuery({
    queryKey: [USER_WORKSPACES_QUERY_KEY],
    queryFn: () => getAllUserWorkspaces(),
    staleTime: 5 * 60 * 1000,
  });

export const useAllWorkspacesWithUsers = () =>
  useQuery({
    queryKey: [USER_WORKSPACES_COUNT_QUERY_KEY],
    queryFn: () => getAllWorkspacesWithUsers(),
    staleTime: 5 * 60 * 1000,
  });

export const useWorkspaceInvitations = () =>
  useQuery({
    queryKey: [INVITATIONS_WORKSPACES_QUERY_KEY],
    queryFn: () => getAllWorkspaceInvitations(),
    staleTime: 5 * 60 * 1000,
  });

export const useWorkspaceMembers = () =>
  useQuery({
    queryKey: [WORKSPACE_MEMBERS_QUERY_KEY],
    queryFn: () => getWorkspaceMembers(),
    staleTime: 5 * 60 * 1000,
  });
