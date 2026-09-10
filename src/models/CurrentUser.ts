import type { UserTypeEnum } from "@/enums/UserTypeEnum";
import type { WorkspaceRoleEnum } from "@/enums/WorkspaceRoleEnum";

/** El mes recién cerrado que el usuario todavía no descartó en su workspace por defecto. Lo pone
 * api-movements (no api-identity) al servir su propio /v1/users/me. */
export interface PendingMonthlySummary {
  year: number;
  month: number;
}

export interface CurrentUserMetadata {
  isFirstLogin: boolean;
  hasSeenTour: boolean;
  userRole: string[];
  /** Rol del usuario en su workspace por defecto — null si no tiene uno configurado, o si no es
   * miembro de ese workspace. */
  workspaceRole: WorkspaceRoleEnum | null;
  /** Cierre de mes pendiente — null/ausente si no hay nada que mostrar. */
  pendingMonthlySummary?: PendingMonthlySummary | null;
}

export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  userType: UserTypeEnum | null;
  metadata: CurrentUserMetadata;
}
