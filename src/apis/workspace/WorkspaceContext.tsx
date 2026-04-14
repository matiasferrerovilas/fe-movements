import { createContext, useContext } from "react";
import type { Membership } from "../../models/UserWorkspace";

export interface WorkspaceContextValue {
  /** Workspace actualmente seleccionado */
  currentWorkspace: Membership | null;
  /** Lista de workspaces disponibles para el usuario */
  workspaces: Membership[];
  /** Cambiar el workspace actual (persiste en backend) */
  setCurrentWorkspace: (workspaceId: number) => void;
  /** Indica si los datos están cargando */
  isLoading: boolean;
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: () => {},
  isLoading: true,
});

export function useCurrentWorkspace(): WorkspaceContextValue {
  return useContext(WorkspaceContext);
}
