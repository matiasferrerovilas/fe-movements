# AGENTS.md — fe-movements

Guía de contexto, convenciones y reglas para agentes que trabajen en este repositorio.

---

## Contexto del proyecto

Aplicación SPA de gestión financiera personal. Permite registrar movimientos, servicios/suscripciones, ingresos, y administrar grupos de usuarios con roles. La UI está completamente en español.

- **Nombre del paquete**: `fe-expenses`
- **Versión**: 1.2.0
- **Backend**: Spring Boot separado. El frontend solo consume via REST (`window.env.backend.api`) y WebSocket STOMP (`window.env.backend.websocketUrl`).
- **Roles de usuario**: `ADMIN`, `FAMILY`, `GUEST`
- **Autenticación**: Keycloak obligatoria al cargar (`login-required`), PKCE S256.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | React 19 + TypeScript (strict, ES2022) |
| Bundler | Vite 7 |
| Routing | TanStack Router v1 (file-based, auto code-splitting) |
| Data fetching | TanStack Query v5 |
| UI components | Ant Design 6 (locale `es-ES`) |
| Auth | Keycloak JS + `@react-keycloak/web` |
| WebSocket | STOMP over SockJS (`@stomp/stompjs` + `sockjs-client`) |
| HTTP | Axios |
| Fechas | DayJS |
| Gráficos | Recharts |
| Testing | Vitest + @testing-library/react + @testing-library/user-event + msw |
| Linting | ESLint + typescript-eslint |
| Pre-commit | Husky |

### Configuración de runtime

No existen archivos `.env`. Toda la configuración es inyectada en el contenedor al arrancar via `window.env`:

```ts
window.env.backend.api          // base URL del backend REST
window.env.backend.websocketUrl // URL WebSocket
window.env.keycloak             // { clientId, realm, url }
```

---

## Estructura del proyecto

```
src/
├── apis/
│   ├── auth/           # AuthContext, AuthProvider, guards de rutas
│   ├── hooks/          # Hooks de React Query (useCurrentUser, useGroups, useMovement, etc.)
│   ├── websocket/      # WebSocketProvider + hooks de suscripción por dominio
│   ├── onboarding/     # API de onboarding
│   ├── movement/       # API de movimientos
│   ├── income/         # API de ingresos
│   ├── settings/       # API de configuración
│   ├── banks/          # API de bancos
│   ├── currencies/     # API de monedas
│   ├── axios.tsx       # Instancia base de Axios
│   ├── AxiosInterceptorProvider.tsx
│   ├── GroupApi.tsx
│   ├── ServiceApi.tsx
│   ├── SubscriptionApi.tsx
│   └── BalanceApi.ts
├── components/         # Componentes UI organizados por feature
│   ├── balance/
│   ├── modals/
│   ├── movements/
│   ├── onboarding/
│   ├── services/
│   ├── settings/
│   ├── utils/
│   ├── NavHeader.tsx
│   └── QueryLoadingBoundary.tsx
├── routes/             # Rutas file-based de TanStack Router (7 rutas)
│   ├── __root.tsx      # Layout raíz: NavHeader + Content + Footer
│   ├── index.tsx       # /
│   ├── balance.tsx     # /balance
│   ├── movement.tsx    # /movement
│   ├── services.tsx    # /services
│   ├── settings.tsx    # /settings
│   └── onboarding.tsx  # /onboarding
├── models/             # Interfaces TypeScript de dominio
├── enums/              # Enums con patrón `as const`
├── features/           # } Scaffolding Feature-Sliced Design (FSD)
├── pages/              # } Vacíos actualmente — dirección futura
├── widgets/            # } de la arquitectura
├── entities/           # }
├── shared/             # }
├── App.tsx             # Root: providers stack + router
├── main.tsx            # Entry point: Keycloak init + ReactDOM render
└── env.ts              # Declaración de tipos de window.env

tests/                  # Todos los tests — espeja la estructura de src/
├── apis/
│   ├── hooks/
│   └── websocket/
├── components/
└── ...
```

---

## TDD — Regla obligatoria

**Todo código nuevo debe tener su test.** Sin excepción: componente, hook, función de utilidad, o función de API que se agregue debe tener un test correspondiente en `tests/`.

### Ubicación de tests

Los tests viven en `tests/` espejando exactamente la ruta de `src/`:

```
src/apis/hooks/useCurrentUser.tsx        → tests/apis/hooks/useCurrentUser.test.tsx
src/components/settings/SettingGroups.tsx → tests/components/settings/SettingGroups.test.tsx
src/components/utils/stringFunctions.ts  → tests/components/utils/stringFunctions.test.ts
```

### Stack de testing

```
vitest                        # runner + assertions
@testing-library/react        # render de componentes + queries DOM
@testing-library/user-event   # simulación de interacciones de usuario
@testing-library/jest-dom     # matchers adicionales (toBeInTheDocument, etc.)
msw                           # mock de requests HTTP de Axios
```

### Qué testear por tipo

**Hooks de React Query** (`src/apis/hooks/`):
- Que llamen al endpoint correcto
- Que retornen los datos esperados en estado de éxito
- Que manejen correctamente el estado de error
- Que respeten el `staleTime`/`gcTime` configurado

**Hooks de WebSocket** (`src/apis/websocket/`):
- Que se suscriban a los topics correctos (con los IDs correctos)
- Que actualicen el cache de React Query al recibir cada tipo de evento
- Que hagan cleanup (unsubscribe) al desmontar

**Componentes** (`src/components/`, `src/routes/`):
- Render del estado inicial
- Interacciones del usuario (clicks, submit de forms)
- Estados condicionales (loading, error, vacío)
- Que las mutaciones se llamen con los parámetros correctos

**Funciones puras / utils**:
- Cobertura de todos los casos, incluyendo edge cases y valores nulos

### Comandos

```bash
pnpm test          # correr todos los tests
pnpm test --watch  # modo watch durante desarrollo
pnpm test --coverage # reporte de cobertura
```

---

## Patrones y convenciones clave

### Autenticación y usuario actual

```ts
// Keycloak subject (UUID) — solo para el topic /topic/account/default/{id}
const { keycloak } = useKeycloak();
const keycloakSubject = keycloak.subject;

// ID interno de DB — para topics de invitaciones y cualquier entidad del backend
const { data: currentUser } = useCurrentUser(); // GET /users/me, staleTime: Infinity
const internalUserId = currentUser?.id;
```

**Nunca usar `keycloak.subject` como ID de usuario en contextos de negocio.** El backend usa IDs internos de DB para invitaciones y membresías.

### React Query

```ts
// Defaults globales en App.tsx
staleTime: 1000 * 60,       // 1 min
gcTime: 1000 * 60 * 5,      // 5 min
refetchOnWindowFocus: false,
retry: 1,

// Para datos invariantes de sesión (useCurrentUser, catálogos estáticos)
staleTime: Infinity,
gcTime: Infinity,
```

Siempre usar `queryClient.invalidateQueries()` después de mutaciones que afecten datos en cache. Nunca mutatar el cache directamente salvo en los WebSocket handlers donde la performance importa.

### WebSocket — patrón de suscripción

```ts
export const useMiSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();

  // 1. callbackRef evita stale closures
  const callbackRef = useRef<((event: EventWrapper<T>) => void) | null>(null);
  if (!callbackRef.current) {
    callbackRef.current = (event) => {
      // actualizar cache o invalidar queries
    };
  }

  // 2. useMemo para topics dinámicos — recalcula solo cuando cambian dependencias
  const topics = useMemo(
    () => memberships.map((m) => `/topic/dominio/${m.accountId}/evento`),
    [memberships],
  );

  // 3. useEffect con guard + cleanup
  useEffect(() => {
    if (!ws.isConnected || !requiredId) return;
    const callback = callbackRef.current!;
    topics.forEach((t) => ws.subscribe(t, callback));
    return () => topics.forEach((t) => ws.unsubscribe(t, callback));
  }, [ws, ws.isConnected, topics, requiredId]);

  return null;
};
```

### WebSocket — tabla de topics y fuente del ID

| Topic | ID | Fuente |
|---|---|---|
| `/topic/invitation/{id}/new` | ID interno DB | `useCurrentUser().data?.id` |
| `/topic/invitation/{id}/update` | ID interno DB | `useCurrentUser().data?.id` |
| `/topic/movimientos/{id}/new\|delete` | `accountId` de membresía | `useGroups()` → `membership.accountId` |
| `/topic/servicios/{id}/new\|update\|remove` | `accountId` de membresía | `useGroups()` → `membership.accountId` |
| `/topic/account/default/{id}` | Keycloak subject | `keycloak.subject` |
| `/topic/account/{id}/leave` | `accountId` de membresía | `useGroups()` → `membership.accountId` |

### Enums

```ts
// Correcto — as const + type alias
export const RoleEnum = {
  ADMIN: "ADMIN",
  FAMILY: "FAMILY",
  GUEST: "GUEST",
} as const;
export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum];

// Incorrecto — nunca usar enum nativo de TypeScript
enum RoleEnum { ADMIN = "ADMIN" } // ❌
```

### Route guards

Toda ruta protegida debe declarar `beforeLoad`:

```ts
export const Route = createFileRoute("/mi-ruta")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});
```

### TypeScript

- Modo strict activo — no ignorar errores de compilación
- Respetar `noUnusedLocals` y `noUnusedParameters` — eliminar variables y parámetros no usados
- Usar `import type` para importaciones de solo tipos (`verbatimModuleSyntax` activo)
- No usar `any` — usar `unknown` + type narrowing cuando el tipo no es conocido

### Formularios

```ts
// Siempre Ant Design Form con useForm y rules declarativas
const [form] = Form.useForm<MiFormType>();

<Form form={form} layout="vertical" onFinish={onFinish}>
  <Form.Item
    name="campo"
    label="Campo"
    rules={[{ required: true, message: "Mensaje de error" }]}
  >
    <Input />
  </Form.Item>
</Form>
```

---

## Arquitectura futura (FSD)

Los directorios `src/features/`, `src/pages/`, `src/widgets/`, `src/entities/`, `src/shared/` son scaffolding de Feature-Sliced Design y están actualmente vacíos. El código activo vive en `src/apis/`, `src/components/`, `src/routes/`, `src/models/`, `src/enums/`. No mover código a FSD sin coordinar previamente.
