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
          "Andá a la sección \"Gastos\" desde el menú",
          "Hacé click en el botón \"Movimiento\" para agregar un nuevo gasto",
          "Completá los datos: monto, moneda, banco, tipo de pago, fecha, descripción y categoría",
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
          "La evolución anual te permite comparar mes a mes",
        ],
      },
      {
        type: "tip",
        content:
          "Si configuraste presupuestos, las alertas te avisan cuando estás cerca de exceder tus límites.",
      },
    ],
  },
];
