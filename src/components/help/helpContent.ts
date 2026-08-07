export interface HelpSection {
  key: string;
  title: string;
  icon: string; // Nombre del icono de Ant Design
  content: HelpParagraph[];
}

export interface HelpParagraph {
  type: "text" | "list" | "tip";
  content: string | string[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    key: "workspace",
    title: "¿Qué es un Workspace?",
    icon: "TeamOutlined",
    content: [
      {
        type: "text",
        content:
          "Un Workspace (espacio de trabajo) es el lugar donde vos y las personas que invites pueden gestionar gastos en común. Pensalo como una \"cuenta compartida\" donde todos los miembros pueden ver y registrar movimientos.",
      },
      {
        type: "list",
        content: [
          "Cada usuario tiene un workspace por defecto al registrarse",
          "Podés crear múltiples workspaces para separar distintos contextos",
          "Podés invitar a otras personas a tu workspace",
          "Los gastos registrados son visibles para todos los miembros",
          "Las categorías y configuraciones son compartidas dentro de cada workspace",
        ],
      },
      {
        type: "text",
        content: "Algunos ejemplos de uso:",
      },
      {
        type: "list",
        content: [
          "Parejas o familias que quieren llevar un control conjunto de sus gastos del hogar",
          "Compañeros de piso que comparten gastos comunes (alquiler, servicios, limpieza)",
          "Freelancers que quieren separar los gastos de cada cliente o proyecto",
          "Propietarios con múltiples propiedades que necesitan trackear gastos por separado",
        ],
      },
      {
        type: "tip",
        content:
          "Podés cambiar entre tus workspaces desde el selector en la barra superior, junto al logo.",
      },
    ],
  },
  {
    key: "invite",
    title: "Cómo invitar miembros",
    icon: "UserAddOutlined",
    content: [
      {
        type: "text",
        content:
          "Podés invitar a otras personas a tu workspace para que puedan ver y registrar gastos en común. Solo necesitás su correo electrónico.",
      },
      {
        type: "list",
        content: [
          "Andá a Ajustes → Mi Workspace",
          "En la sección de miembros hacé click en \"Invitar\"",
          "Ingresá el correo electrónico de la persona",
          "La persona recibirá un email con la invitación",
          "Una vez que acepte, podrá ver y registrar gastos en tu workspace",
        ],
      },
      {
        type: "tip",
        content:
          "Las invitaciones pendientes aparecen en la parte superior de la pestaña Mi Workspace hasta que la persona las acepte o rechace.",
      },
    ],
  },
  {
    key: "movements",
    title: "Movimientos y gastos",
    icon: "DollarOutlined",
    content: [
      {
        type: "text",
        content:
          "Los movimientos son el corazón de la aplicación. Cada vez que gastás dinero, podés registrarlo para llevar un control detallado de tus finanzas.",
      },
      {
        type: "list",
        content: [
          "Andá a la sección \"Movimientos\" desde el menú",
          "Hacé click en el botón \"Movimiento\" para agregar un nuevo gasto",
          "Completá los datos: monto, moneda, banco, tipo de pago, fecha, descripción y categoría",
          "También podés importar movimientos en lote desde la pestaña de importación del mismo formulario",
          "Los gastos aparecen en la lista ordenados por fecha",
          "Podés editar o eliminar cualquier gasto desde la tabla",
        ],
      },
      {
        type: "tip",
        content:
          "Usá los filtros de la tabla para buscar movimientos por descripción, tipo, banco, moneda o categoría.",
      },
    ],
  },
  {
    key: "budgets",
    title: "Presupuestos",
    icon: "FundOutlined",
    content: [
      {
        type: "text",
        content:
          "Los presupuestos te permiten fijar un límite de gasto por categoría y moneda, y ver en tiempo real cuánto llevás gastado sobre ese límite.",
      },
      {
        type: "list",
        content: [
          "Andá a la sección \"Presupuestos\" desde el menú",
          "Elegí la moneda para la que querés ver o crear presupuestos",
          "Creá un presupuesto por categoría: puede ser mensual, anual o recurrente (se repite todos los meses)",
          "Cada tarjeta muestra lo presupuestado, lo gastado y una barra de progreso",
          "La barra cambia de color a medida que te acercás o superás el límite (verde, amarillo, rojo)",
          "Podés editar el monto o eliminar un presupuesto en cualquier momento",
        ],
      },
      {
        type: "tip",
        content:
          "Si configurás presupuestos, vas a recibir alertas en el Balance cuando estés cerca de exceder tus límites.",
      },
    ],
  },
  {
    key: "investments",
    title: "Inversiones",
    icon: "LineChartOutlined",
    content: [
      {
        type: "text",
        content:
          "La sección de Inversiones te permite llevar un registro de tus inversiones (acciones, plazos fijos, cripto, fondos, etc.) por fuera de tus gastos e ingresos habituales.",
      },
      {
        type: "list",
        content: [
          "Andá a Inversiones desde el menú de tu perfil (avatar, arriba a la derecha)",
          "Agregá una inversión indicando monto, moneda, tipo y fecha",
          "El resumen superior muestra el total invertido",
          "Podés editar o eliminar cualquier inversión desde la tabla",
          "Los tipos de inversión (Acciones, FCI, Cripto, Plazo Fijo, etc.) son personalizables",
        ],
      },
      {
        type: "tip",
        content:
          "Podés crear y personalizar tus propios tipos de inversión (nombre, ícono y color) desde Ajustes → Inversiones, y marcar uno como tipo por defecto.",
      },
    ],
  },
  {
    key: "income",
    title: "Ingresos",
    icon: "WalletOutlined",
    content: [
      {
        type: "text",
        content:
          "Los ingresos representan tu sueldo u otras entradas de dinero recurrentes. Se configuran una vez y podés hacer que se generen automáticamente cada mes.",
      },
      {
        type: "list",
        content: [
          "Andá a Ajustes → Mis finanzas para ver la sección de Ingresos",
          "Agregá un ingreso indicando monto, moneda y banco",
          "Podés recargar (repetir) un ingreso existente con un click en vez de cargarlo de nuevo a mano",
          "Eliminá un ingreso si ya no corresponde",
        ],
      },
      {
        type: "tip",
        content:
          "Activá \"Ingresos automáticos\" en Ajustes → Preferencias para que tus ingresos configurados se registren solos como movimientos cada mes, sin tener que cargarlos manualmente.",
      },
    ],
  },
  {
    key: "utilities",
    title: "Utilidades: tiempo de recuperación",
    icon: "CalculatorOutlined",
    content: [
      {
        type: "text",
        content:
          "La calculadora de tiempo de recuperación te ayuda a dimensionar un gasto grande: estima cuántos meses de ahorro promedio te llevaría recuperarlo.",
      },
      {
        type: "list",
        content: [
          "Andá a Utilidades desde el menú de tu perfil (avatar, arriba a la derecha)",
          "Ingresá el monto del gasto y la moneda",
          "Opcionalmente, elegí cuántos meses hacia atrás usar para calcular tu ahorro promedio (por defecto 3)",
          "El resultado muestra tu ahorro promedio mensual y el tiempo estimado de recuperación",
          "Si tu ahorro promedio de ese período fue cero o negativo, te avisa que el gasto no es recuperable a ese ritmo",
        ],
      },
      {
        type: "tip",
        content:
          "Es una herramienta de referencia rápida: no guarda nada, solo calcula en base a tus movimientos ya cargados.",
      },
    ],
  },
  {
    key: "settings",
    title: "Ajustes",
    icon: "SettingOutlined",
    content: [
      {
        type: "text",
        content:
          "Desde Ajustes podés configurar todo lo relacionado a tu cuenta, tu workspace y tus finanzas.",
      },
      {
        type: "list",
        content: [
          "Cuenta: tus datos personales y tipo de usuario",
          "Workspace: invitaciones pendientes, workspace actual y categorías compartidas",
          "Mis finanzas: bancos, monedas propias e ingresos",
          "Inversiones: tipos de inversión personalizables",
          "Preferencias: automatizaciones como los ingresos automáticos",
        ],
      },
      {
        type: "tip",
        content:
          "En Mis finanzas podés crear tus propias monedas además de las globales del sistema. Las que vos creás se pueden eliminar libremente; las globales o la que tenés configurada como moneda por defecto, no.",
      },
    ],
  },
  {
    key: "services",
    title: "Servicios y suscripciones",
    icon: "CalendarOutlined",
    content: [
      {
        type: "text",
        content:
          "Los servicios son gastos recurrentes que se repiten cada mes. Pueden ser tanto personales (Netflix, Spotify, luz, gas) como de negocio (hosting, dominio, software, coworking, seguros).",
      },
      {
        type: "list",
        content: [
          "Andá a la sección \"Servicios\" desde el menú principal",
          "Completá el formulario de la primera tarjeta para agregar un nuevo servicio",
          "Indicá el nombre, monto mensual y si ya está pago este mes",
          "Cada servicio aparece como una tarjeta que podés marcar como pagado",
          "El resumen superior te muestra cuántos servicios tenés al día y cuántos pendientes",
        ],
      },
      {
        type: "tip",
        content:
          "Registrar los servicios te ayuda a tener una visión clara de tus gastos fijos mensuales y no olvidarte de pagar ninguno.",
      },
    ],
  },
  {
    key: "balance",
    title: "Balance y reportes",
    icon: "PieChartOutlined",
    content: [
      {
        type: "text",
        content:
          "La página principal te muestra un resumen completo de tus finanzas del mes. Podés ver cuánto ingresaste, cuánto gastaste y cómo se distribuyen tus gastos.",
      },
      {
        type: "list",
        content: [
          "El resumen mensual muestra ingresos, gastos y la diferencia neta",
          "Si tenés movimientos en múltiples monedas, podés ver cada una por separado",
          "El \"Top 5 Categorías\" te muestra dónde se va la mayor parte de tu plata",
          "El gráfico de torta visualiza la distribución por categorías",
          "La evolución anual te permite comparar mes a mes, filtrando por moneda (tu selección se guarda para la próxima vez)",
        ],
      },
      {
        type: "tip",
        content:
          "Si configuraste presupuestos, las alertas te avisan cuando estás cerca de exceder tus límites.",
      },
    ],
  },
  {
    key: "admin",
    title: "Panel de administración",
    icon: "SafetyOutlined",
    content: [
      {
        type: "text",
        content:
          "El panel de administración es visible solo para usuarios con rol Admin. Permite gestionar configuraciones globales que afectan a todo tu workspace.",
      },
      {
        type: "list",
        content: [
          "Accedé desde \"Admin\" en el menú de tu perfil (avatar, arriba a la derecha) — solo aparece si tenés rol de administrador",
          "Mi Perfil: configurá tu tipo de usuario (particular o negocio), que ajusta las etiquetas y textos de toda la app",
          "Mantenimiento: espacio reservado para futuras acciones administrativas",
        ],
      },
      {
        type: "tip",
        content:
          "Si no ves \"Admin\" en tu menú, es porque tu rol actual es Family o Guest — pedile a un administrador del workspace que te asigne el rol si lo necesitás.",
      },
    ],
  },
];
