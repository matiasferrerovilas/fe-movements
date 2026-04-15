import type { UserTypeEnum } from "../../enums/UserTypeEnum";

/**
 * Retorna los labels personalizados según el tipo de usuario.
 * CONSUMER → Uso personal (Familia, sueldo, categorías personales)
 * COMPANY → Uso empresarial (Proyectos, ingresos, gastos del negocio)
 */
export const getEntityLabels = (userType: UserTypeEnum | null) => {
  const isCompany = userType === "COMPANY";

  return {
    // === WORKSPACE ===
    workspace: isCompany ? "Espacio de trabajo" : "Workspace",
    workspaces: isCompany ? "Espacios de trabajo" : "Workspaces",
    workspaceSingular: isCompany ? "espacio de trabajo" : "workspace",
    workspacesLower: isCompany ? "espacios de trabajo" : "workspaces",

    workspaceQuestion: isCompany
      ? "¿Querés crear algunos espacios de trabajo?"
      : "¿Querés crear algunos workspaces?",

    workspaceDescription: isCompany
      ? "Un espacio de trabajo sirve para organizar gastos por proyecto, cliente o departamento."
      : "Un workspace sirve para agrupar movimientos.",

    workspaceDefault: isCompany
      ? "Por defecto se crea uno para tu empresa."
      : "Por defecto se crea uno para tus movimientos propios.",

    workspacePlaceholder: isCompany
      ? "Ej: Proyecto Alpha, Cliente X, Marketing, Operaciones..."
      : "Ej: Familia, Trabajo, Personal...",

    workspaceCrear: isCompany ? "Crear espacio de trabajo" : "Crear workspace",
    workspaceNuevo: isCompany
      ? "Crear nuevo espacio de trabajo"
      : "Crear nuevo workspace",
    workspaceNombreLabel: isCompany
      ? "Nombre del espacio"
      : "Nombre del workspace",
    workspaceActivo: isCompany
      ? "Espacio de trabajo activo"
      : "Workspace activo",
    workspaceGestionar: isCompany
      ? "Gestiona el espacio de trabajo actual"
      : "Gestiona el workspace actual",
    workspaceSalir: isCompany
      ? "¿Estás seguro de que quieres salir del espacio de trabajo?"
      : "¿Estás seguro de que quieres salir del grupo?",
    workspaceNoMiembros: isCompany
      ? "No hay miembros en este espacio"
      : "No hay miembros en este workspace",

    // === MIEMBROS ===
    miembro: isCompany ? "Colaborador" : "Miembro",
    miembros: isCompany ? "Colaboradores" : "Miembros",
    miembroInvitar: isCompany
      ? "Invitar colaborador"
      : "Invitar miembro al grupo",
    miembroEmail: isCompany
      ? "Correo electrónico del colaborador"
      : "Correo electrónico del usuario",

    // === INGRESOS ===
    ingresoTitulo: isCompany ? "Ingreso mensual estimado" : "Sueldo mensual",
    ingresoLabel: isCompany
      ? "¿Cuál es tu ingreso mensual estimado?"
      : "¿Cuál es tu sueldo mensual?",
    ingresoDescripcion: isCompany
      ? "Configurá tus ingresos recurrentes (facturación mensual, contratos). Se genera un movimiento automático cada mes."
      : "Configurá tu ingreso mensual. Se genera un movimiento automático cada mes en el workspace activo.",
    ingresoOnboarding: isCompany
      ? "Ingresá el ingreso inicial de caja"
      : "Ingresá tu ingreso mensual",
    ingresoOnboardingDiario: isCompany
      ? "Ingresá tu ingreso diario si tenés"
      : "Ingresá tu ingreso diario si tenés",
    ingresoOnboardingDescription: isCompany
      ? "Ingresá tu ingreso diario si tenés"
      : "Ingresá tu ingreso mensual",
    ingresoAmountLabel: isCompany
      ? "¿Cuál es tu ingreso mensual estimado?"
      : "¿Cuál es tu sueldo mensual?",

    // === BANCOS ===
    bancosSubtitle: isCompany
      ? "Agregá y gestioná las cuentas bancarias de la empresa."
      : "Agregá y gestioná los bancos en tu lista personal.",
    bancosQuitar: isCompany
      ? "Se quitará de la lista de cuentas."
      : "Se quitará de tu lista personal.",

    // === CATEGORÍAS ===
    categoriasSubtitle: isCompany
      ? "Agregá y gestioná las categorías de gastos del negocio."
      : "Agregá y gestioná tus categorías personales.",
    categoriasOnboarding: isCompany
      ? "Agregá las categorías con las que clasificás los gastos del negocio."
      : "Agregá las categorías con las que clasificás tus gastos.",
    categoriaPlaceholder: isCompany
      ? "Ej: Nómina, Marketing, Hosting, Materiales..."
      : "Ej: Hogar, Transporte, Entretenimiento...",
    categoriasQuitar: isCompany
      ? "Se quitará de la lista de categorías."
      : "Se quitará de tu lista personal.",

    // === SETTINGS ===
    settingsTabWorkspace: isCompany
      ? "Mi Espacio de Trabajo"
      : "Mi Workspace",
    settingsTabFinanzas: isCompany ? "Finanzas de la Empresa" : "Mis finanzas",
    settingsCuentaAcciones: isCompany
      ? "Acciones irreversibles sobre la cuenta y datos de la empresa."
      : "Acciones irreversibles sobre tu cuenta y datos.",

    // === ONBOARDING ===
    onboardingBienvenida: isCompany
      ? "Antes de comenzar configuremos tu empresa."
      : "Antes de comenzar configuremos tu cuenta.",

    // === TOUR ===
    tourBalance: isCompany
      ? "Visualiza el resumen de los ingresos y gastos. Gráficos por categoría, grupo y evolución mensual."
      : "Visualiza el resumen de tus ingresos y gastos. Gráficos por categoría, grupo y evolución mensual.",
    tourGastos: isCompany
      ? "Registra y consulta todos los movimientos. Filtra por tipo, banco, categoría y más."
      : "Registra y consulta todos tus movimientos. Filtra por tipo, banco, categoría y más.",

    // === PRESUPUESTOS ===
    presupuestoGrupo: isCompany ? "espacio de trabajo" : "grupo",

    // === GENERALES ===
    tus: isCompany ? "los" : "tus", // "tus ingresos" → "los ingresos"
    tuCuenta: isCompany ? "la empresa" : "tu cuenta",

    // === USER TYPE DISPLAY ===
    userTypeDisplay: isCompany ? "Empresa" : "Personal",
  };
};
