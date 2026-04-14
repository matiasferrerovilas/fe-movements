import type { UserTypeEnum } from "../../enums/UserTypeEnum";

/**
 * Retorna los labels de "Servicios" según el tipo de usuario.
 * CONSUMER → "Servicios" (uso personal: Netflix, luz, agua)
 * COMPANY → "Gastos Recurrentes" (uso empresarial: hosting, software, seguros)
 */
export const getServiceLabels = (userType: UserTypeEnum | null) => {
  const isCompany = userType === "COMPANY";

  return {
    // Singular
    singular: isCompany ? "Gasto Recurrente" : "Servicio",
    singularLower: isCompany ? "gasto recurrente" : "servicio",

    // Plural
    plural: isCompany ? "Gastos Recurrentes" : "Servicios",
    pluralLower: isCompany ? "gastos recurrentes" : "servicios",

    // Frases comunes
    nuevo: isCompany ? "Nuevo Gasto Recurrente" : "Nuevo Servicio",
    agregar: isCompany ? "Agregar Gasto" : "Agregar Servicio",
    total: isCompany ? "Total Gastos" : "Total Servicios",
    registrados: isCompany ? "gastos registrados" : "servicios registrados",
    alDia: isCompany ? "gastos al día" : "servicios al día",
    pendientes: isCompany ? "gastos pendientes" : "servicios pendientes",
    eliminar: isCompany
      ? "¿Eliminar el gasto recurrente?"
      : "¿Eliminar el servicio?",

    // Tour
    tourTitle: isCompany ? "Gastos Recurrentes" : "Servicios",
    tourDescription: isCompany
      ? "Gestiona tus gastos operativos recurrentes. Lleva control de pagos mensuales del negocio."
      : "Gestiona tus suscripciones y servicios recurrentes. Lleva control de pagos mensuales.",
  };
};
