import type { TFunction } from "i18next";
import type { UserTypeEnum } from "@/enums/UserTypeEnum";

/**
 * Retorna los labels personalizados según el tipo de usuario, usando el feature de contexto de
 * i18next (sufijos `_personal`/`_company` bajo common.entity.*) para resolver PERSONAL vs
 * ENTERPRISE — mismo patrón que getServiceLabels y el entity-labels.ts portado a movements-mobile.
 */
export const getEntityLabels = (userType: UserTypeEnum | null, t: TFunction) => {
  const isCompany = userType === "ENTERPRISE";
  const context = isCompany ? "company" : "personal";
  const e = (key: string) => t(`common.entity.${key}`, { context });

  return {
    // === WORKSPACE ===
    workspace: e("workspace"),
    workspaces: e("workspaces"),
    workspaceSingular: e("workspaceSingular"),
    workspacesLower: e("workspacesLower"),

    workspaceQuestion: e("workspaceQuestion"),
    workspaceDescription: e("workspaceDescription"),
    workspaceDefault: e("workspaceDefault"),
    workspacePlaceholder: e("workspacePlaceholder"),

    workspaceCrear: e("workspaceCrear"),
    workspaceNuevo: e("workspaceNuevo"),
    workspaceNombreLabel: e("workspaceNombreLabel"),
    workspaceActivo: e("workspaceActivo"),
    workspaceGestionar: e("workspaceGestionar"),
    workspaceSalir: e("workspaceSalir"),
    workspaceNoMiembros: e("workspaceNoMiembros"),

    // === MIEMBROS ===
    miembro: e("miembro"),
    miembros: e("miembros"),
    miembroInvitar: e("miembroInvitar"),
    miembroEmail: e("miembroEmail"),

    // === INGRESOS ===
    ingresoTitulo: e("ingresoTitulo"),
    ingresoLabel: e("ingresoLabel"),
    ingresoDescripcion: e("ingresoDescripcion"),
    ingresoOnboarding: e("ingresoOnboarding"),
    ingresoOnboardingDiario: e("ingresoOnboardingDiario"),
    ingresoOnboardingDescription: e("ingresoOnboardingDescription"),
    ingresoAmountLabel: e("ingresoAmountLabel"),

    // === BANCOS ===
    bancosSubtitle: e("bancosSubtitle"),
    bancosQuitar: e("bancosQuitar"),

    // === CATEGORÍAS ===
    categoriasSubtitle: e("categoriasSubtitle"),
    categoriasOnboarding: e("categoriasOnboarding"),
    categoriaPlaceholder: e("categoriaPlaceholder"),
    categoriasQuitar: e("categoriasQuitar"),

    // === MONEDAS ===
    monedasSubtitle: e("monedasSubtitle"),
    monedasQuitar: e("monedasQuitar"),

    // === SETTINGS ===
    settingsTabWorkspace: e("settingsTabWorkspace"),
    settingsTabFinanzas: e("settingsTabFinanzas"),
    settingsCuentaAcciones: e("settingsCuentaAcciones"),

    // === ONBOARDING ===
    onboardingBienvenida: e("onboardingBienvenida"),

    // === TOUR ===
    tourBalance: e("tourBalance"),
    tourGastos: e("tourGastos"),

    // === PRESUPUESTOS ===
    presupuestoGrupo: e("presupuestoGrupo"),

    // === GENERALES ===
    tus: e("tus"), // "tus ingresos" → "los ingresos"
    tuCuenta: e("tuCuenta"),

    // === USER TYPE DISPLAY ===
    userTypeDisplay: e("userTypeDisplay"),
  };
};
