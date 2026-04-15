export interface Category {
  id: number;
  description: string;
  isActive: boolean;
  isDeletable: boolean;
  /** ID del workspace al que pertenece la categoría (null = categoría global/legacy) */
  workspaceId?: number | null;
  /** Nombre del ícono de Ant Design (ej: "HomeOutlined") */
  iconName?: string | null;
  /** Color del ícono en formato hexadecimal (ej: "#faad14") */
  iconColor?: string | null;
}
