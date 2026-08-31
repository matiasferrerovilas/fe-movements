import { useCurrentWorkspace } from "@/apis/workspace/WorkspaceContext";
import { WorkspaceRoleEnum } from "@/enums/WorkspaceRoleEnum";

/**
 * True cuando el rol del usuario en el workspace activo es READ_ONLY — usado para ocultar
 * (no solo deshabilitar) cualquier acción de crear/editar/borrar en la UI. Deriva de
 * `currentWorkspace` (ya viene con la lista de workspaces, se actualiza sin round-trip extra al
 * cambiar de workspace) en vez de `/users/me`, que puede quedar stale tras un cambio de workspace
 * porque su query tiene staleTime: Infinity.
 */
export function useIsReadOnly(): boolean {
  const { currentWorkspace } = useCurrentWorkspace();
  return currentWorkspace?.metadata.role === WorkspaceRoleEnum.READ_ONLY;
}
