export const ColorEnum = {
  ROJO_FALTA_PAGO: "var(--rojo-falta-pago)",
  ROJO_FALTA_PAGO_BORDE: "var(--rojo-falta-pago-borde)",

  VERDE_PAGADO: "var(--verde-pagado)",
  VERDE_PAGADO_BORDE: "var(--verde-pagado-borde)",
  VERDE_INGRESO_TABLA: "var(--verde-ingreso-tabla)",
  VERDE_INGRESO_TABLA_HOVER: "var(--verde-ingreso-tabla-hover)",

  FONDO_BOTON_ACTIVO: "var(--fondo-boton-activo)",
  FONDO_GENERAL: "var(--fondo-general)",

  TEXTO_ACTIVO_AZUL: "var(--texto-activo-azul)",
} as const;
export type ColorEnum = (typeof ColorEnum)[keyof typeof ColorEnum];
