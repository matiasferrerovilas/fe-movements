# Spec: Sección de Inversiones

**Fecha:** 2026-05-26  
**Feature:** Nueva ruta `/inversiones` — gestión y seguimiento de portfolio de inversiones personales

---

## Contexto

La app ya gestiona movimientos, servicios e ingresos. Se agrega una sección de inversiones para registrar capital invertido por instrumento y ver en tiempo real si hay ganancia o pérdida, usando el precio actualizado que devuelve el backend (que a su vez conecta con fuentes externas: Yahoo Finance para acciones/ETFs/crypto, CNMV para fondos españoles por ISIN).

---

## Modelos de datos

### `InvestmentType`
Viene del backend, igual que `Category`. El frontend no hardcodea los tipos.

```ts
// src/models/InvestmentType.ts
interface InvestmentType {
  id: number;
  description: string;       // "Acciones", "FCI", "Crypto", etc.
  iconName?: string | null;  // ícono Ant Design
  iconColor?: string | null; // color hex
}
```

### `Investment`

```ts
// src/models/Investment.ts
interface Investment {
  id: number;
  instrumento: string;             // ticker / ISIN / nombre libre
  tipo: InvestmentType;
  montoInvertido: number;
  valorActual: number;             // actualizado por el backend
  fechaInversion: string;          // ISO date
  moneda: Currency;
  account: AccountWithoutMembers;  // workspace, igual que Movement
}

interface CreateInvestmentForm {
  instrumento: string;
  tipoId: number;
  montoInvertido: number;
  currency: string;
  fechaInversion: Date;
}
```

La **ganancia/pérdida no se persiste** — se calcula siempre en el frontend como `valorActual - montoInvertido`. El porcentaje de rendimiento es `((valorActual - montoInvertido) / montoInvertido) * 100`.

---

## API REST

Archivo: `src/apis/investment/InvestmentApi.ts`  
`BASE_PATH = "investments"` → `/v1/investments` (sin duplicar el prefijo)

| Método | Path | Descripción |
|---|---|---|
| GET | `/investments?accountId=X` | Lista de inversiones del workspace |
| POST | `/investments` | Crear inversión |
| PUT | `/investments/:id` | Editar inversión |
| DELETE | `/investments/:id` | Eliminar inversión |
| GET | `/investment-types` | Catálogo de tipos |

---

## Hooks React Query

| Hook | Archivo | staleTime |
|---|---|---|
| `useInvestments(accountId)` | `src/apis/hooks/useInvestments.tsx` | 1 min (el valorActual cambia) |
| `useInvestmentTypes()` | `src/apis/hooks/useInvestmentTypes.tsx` | Infinity (catálogo estático) |

Después de mutaciones (crear, editar, eliminar): `queryClient.invalidateQueries({ queryKey: ["investments", accountId] })`.

---

## WebSocket

Hook: `src/apis/websocket/useInvestmentsSubscription.ts`

| Topic | ID | Fuente |
|---|---|---|
| `/topic/investments/{accountId}/update` | `accountId` de membresía | `useGroups()` → `membership.accountId` |

El handler invalida `useInvestments` para que React Query refetchee con el nuevo `valorActual`. Sigue el patrón `callbackRef` + `useMemo` + `useEffect` con guard y cleanup documentado en CLAUDE.md.

---

## UI — Ruta `/inversiones`

Archivo: `src/routes/inversiones.tsx`  
Guard: `protectedRouteGuard({ roles: [ADMIN, FAMILY, GUEST] })`

### Bloque superior — resumen del portfolio

4 cards en fila (apiladas en mobile, usando `Grid.useBreakpoint`):

| Card | Valor |
|---|---|
| Total invertido | Suma de `montoInvertido` |
| Valor actual | Suma de `valorActual` |
| Ganancia/pérdida | Diferencia en monto (color verde/rojo) |
| Rendimiento | Diferencia en % sobre total invertido (verde/rojo) |

Filtro de workspace arriba del bloque (selector de cuenta, igual que en movimientos).

### Bloque inferior — tabla de inversiones

Columnas:
- **Instrumento** — texto libre
- **Tipo** — `InvestmentType.description` con ícono/color
- **Monto invertido** — con símbolo de moneda
- **Valor actual** — con símbolo de moneda
- **G/P** — `valorActual - montoInvertido`, color verde si positivo, rojo si negativo
- **Rendimiento %** — igual, coloreado
- **Fecha** — `fechaInversion` formateada
- **Hace cuánto** — calculado con `dayjs().from(fechaInversion)`
- **Acciones** — editar / eliminar

Botón **+ Agregar inversión** (arriba de la tabla) abre un modal/drawer con el formulario: instrumento (Input), tipo (Select con datos de `useInvestmentTypes`), monto (InputNumber), moneda (Select), fecha (DatePicker).

Formulario usa `Form.useForm` con `rules` declarativas de Ant Design, igual que el resto de la app.

---

## Componentes

```
src/components/investments/
├── InvestmentDashboard.tsx   # 4 cards de resumen
├── InvestmentTable.tsx       # tabla con acciones
└── InvestmentForm.tsx        # formulario crear/editar (modal)
```

---

## Tests

Espeja `src/` en `tests/`:

| Test | Qué verifica |
|---|---|
| `tests/apis/hooks/useInvestments.test.tsx` | Endpoint correcto, datos de éxito, error, staleTime 1min |
| `tests/apis/hooks/useInvestmentTypes.test.tsx` | Endpoint correcto, staleTime Infinity |
| `tests/apis/websocket/useInvestmentsSubscription.test.tsx` | Subscribe a topics correctos, invalida cache al recibir update, cleanup al desmontar |
| `tests/components/investments/InvestmentDashboard.test.tsx` | Render de KPIs, cálculo correcto de totales |
| `tests/components/investments/InvestmentTable.test.tsx` | Render de lista, colores G/P, "hace cuánto" |
| `tests/components/investments/InvestmentForm.test.tsx` | Submit con parámetros correctos, validaciones requeridas |

---

## Fuera de scope (iteración futura)

- Widget de portfolio en el home
- Historial de rendimiento / evolución temporal
- Soporte para precio por unidad y cantidad de unidades
- Configuración del conector de precios desde el frontend
