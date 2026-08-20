import type { TFunction } from "i18next";
import { WorkspaceEnum } from "@/enums/WorkspaceEnum";
import type { Workspace } from "@/models/UserWorkspace";

/** El backend nombra el workspace personal de cada usuario "DEFAULT" — se muestra como "Personal". */
export const getWorkspaceDisplayName = (workspaceName: string, t: TFunction): string =>
  workspaceName === WorkspaceEnum.DEFAULT ? t("common.workspace.personalName") : workspaceName;

/**
 * El DEFAULT (personal) de otro usuario aparece en tu propia lista cuando te suman como
 * colaborador ahí (p.ej. te invitaron a su workspace personal) — a diferencia de tu propio
 * DEFAULT, ahí tu rol no es OWNER.
 */
export const isForeignPersonalWorkspace = (
  workspace: Pick<Workspace, "workspaceName" | "metadata">,
): boolean => workspace.workspaceName === WorkspaceEnum.DEFAULT && workspace.metadata.role !== "OWNER";

export const getWorkspaceOwnerEmail = (
  workspace: Pick<Workspace, "metadata">,
): string | undefined => workspace.metadata.memberDetails.find((m) => m.role === "OWNER")?.email;
