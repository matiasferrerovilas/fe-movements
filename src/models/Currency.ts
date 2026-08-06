export interface Currency {
  id: number;
  symbol: string;
  description: string;
  /** ID del workspace al que pertenece la moneda (null = catálogo global/por defecto) */
  workspaceId?: number | null;
  /** true si el usuario puede eliminarla (no es global y no está en uso) */
  isDeletable: boolean;
}

export interface CurrencyRecord {
  symbol: string;
}
