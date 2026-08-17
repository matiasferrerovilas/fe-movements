import axios from "axios";

export const api = axios.create({
  baseURL: window.env.backend.api,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// El default de 5s alcanza para el CRUD normal, pero parsear un resumen bancario en PDF del
// lado del servidor puede tardar bastante más — se pasa por request en vez de subir el default
// de la instancia, para que fallas reales en llamadas livianas se noten rápido igual.
export const LONG_OPERATION_TIMEOUT_MS = 60_000;
