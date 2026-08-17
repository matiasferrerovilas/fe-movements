import type { TFunction } from "i18next";
import type { UserTypeEnum } from "@/enums/UserTypeEnum";

/**
 * Retorna los labels de "Servicios" según el tipo de usuario, usando el feature de contexto de
 * i18next (sufijos `_personal`/`_company` en services.json) para resolver PERSONAL vs ENTERPRISE.
 * PERSONAL → "Servicios" (uso personal: Netflix, luz, agua)
 * ENTERPRISE → "Gastos Recurrentes" (uso empresarial: hosting, software, seguros)
 */
export const getServiceLabels = (userType: UserTypeEnum | null, t: TFunction) => {
  const isCompany = userType === "ENTERPRISE";
  const context = isCompany ? "company" : "personal";
  const s = (key: string) => t(`services.labels.${key}`, { context });

  return {
    // Singular
    singular: s("singular"),
    singularLower: s("singularLower"),

    // Plural
    plural: s("plural"),
    pluralLower: s("pluralLower"),

    // Frases comunes
    nuevo: s("nuevo"),
    agregar: s("agregar"),
    total: s("total"),
    registrados: s("registrados"),
    alDia: s("alDia"),
    pendientes: s("pendientes"),
    eliminar: s("eliminar"),

    // Tour
    tourTitle: s("tourTitle"),
    tourDescription: s("tourDescription"),
  };
};
