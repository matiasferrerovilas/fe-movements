import type { UserTypeEnum } from "@/enums/UserTypeEnum";
import type { WorkspaceRoleEnum } from "@/enums/WorkspaceRoleEnum";

export interface CurrentUserMetadata {
  isFirstLogin: boolean;
  hasSeenTour: boolean;
  userRole: string[];
  /** Rol del usuario en su workspace por defecto — null si no tiene uno configurado, o si no es
   * miembro de ese workspace. */
  workspaceRole: WorkspaceRoleEnum | null;
}

export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  userType: UserTypeEnum | null;
  metadata: CurrentUserMetadata;
}
