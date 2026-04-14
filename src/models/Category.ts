export interface Category {
  id: number;
  description: string;
  isActive: boolean;
  isDeletable: boolean;
  /** ID del workspace al que pertenece la categoría (null = categoría global/legacy) */
  workspaceId?: number | null;
}
