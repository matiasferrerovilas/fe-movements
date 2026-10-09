/** Respuesta de POST /expenses/import-file: movimientos guardados y salteados por estar ya cargados. */
export interface ImportResult {
  imported: number;
  duplicated: number;
}
