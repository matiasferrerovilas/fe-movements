# Análisis de Seguridad STRIDE — fe-movements

**Fecha:** 2026-05-26  
**Versión analizada:** rama `main` (post inversiones feature)  
**Alcance:** Frontend SPA únicamente — el backend Spring Boot queda fuera de scope.

---

## Contexto de la aplicación

SPA de finanzas personales con las siguientes características de seguridad relevantes:

- Autenticación obligatoria via Keycloak (PKCE S256, `login-required`)
- Roles: `ADMIN`, `FAMILY`, `GUEST`
- Transporte: REST sobre HTTPS + WebSocket STOMP sobre SockJS
- Sin archivos `.env` — configuración inyectada en `window.env` al arrancar el contenedor
- Tokens JWT renovados automáticamente (buffer 30s en `AxiosInterceptorProvider`)

---

## S — Spoofing (Suplantación de identidad)

### ✅ Protecciones en vigor

| Mecanismo | Detalle |
|---|---|
| PKCE S256 | Protege el authorization code contra interception attacks |
| `login-required` | Sin excepción — toda ruta requiere sesión activa |
| Token en memoria | `@react-keycloak/web` almacena el token en memoria JS, no en `localStorage` ni cookies → fuera del alcance de XSS persistente |
| Renovación automática | `updateToken(30)` antes de cada request; reintento con `updateToken(-1)` en 401 |
| Guard en `beforeLoad` | Redirect a `/` si el rol no coincide — previene acceso a rutas restringidas |

### ⚠️ Amenazas identificadas

**S-1 — Token JWT en query string del WebSocket** *(Severidad: Media)*

```ts
// WebSocketProvider.tsx:51
webSocketFactory: () => new SockJS(`${baseUrl}/ws?access_token=${token}`)
```

El JWT viaja como parámetro de URL. Esto lo expone en:
- Logs de acceso del servidor/proxy
- Historial del navegador
- Cabeceras `Referer` si el WS realiza redirects

El JWT contiene `sub`, `email`, `realm_access.roles` y otros claims.

**Mitigación:** Enviar el token como header STOMP (`connectHeaders: { Authorization: \`Bearer ${token}\` }`) en lugar de en la URL.

---

**S-2 — Bypass de guard durante el loading de autenticación** *(Severidad: Baja)*

```ts
// protectedRouteGuard.tsx:12
if (auth.loading) return; // ← retorna undefined, no redirige
```

Durante el tiempo de carga de Keycloak el guard no bloquea ni redirige. Si el router renderiza la ruta antes de que `auth.loading` se vuelva `false`, el componente puede montarse brevemente sin sesión. En la práctica `AxiosInterceptorProvider` bloquea el render hasta que Keycloak está inicializado, mitigando esto.

---

## T — Tampering (Manipulación de datos)

### ✅ Protecciones en vigor

- Bearer token en cada request REST — el backend puede rechazar tokens inválidos o expirados
- Axios `timeout: 5000` — los requests no pueden quedar colgados indefinidamente
- Validaciones declarativas en formularios Ant Design (`rules` con `required`)
- STOMP sobre SockJS con autenticación JWT en la handshake

### ⚠️ Amenazas identificadas

**T-1 — Sin validación de schema en mensajes WebSocket** *(Severidad: Media)*

```ts
// WebSocketProvider.tsx:69
const payload = JSON.parse(message.body);
callbacks.forEach((cb) => cb(payload));
```

El payload se parsea y distribuye sin ninguna validación de estructura. Un mensaje malformado o inesperado del servidor podría:
- Causar errores en cascada en los handlers de React Query
- Inyectar datos con estructura incorrecta en el cache

**Mitigación:** Validar la estructura del `EventWrapper` antes de distribuirlo (mínimo: verificar que `eventType` existe y es un valor conocido).

---

**T-2 — `window.env` accesible a scripts de terceros** *(Severidad: Baja en este contexto)*

`window.env.backend.api` y `window.env.backend.websocketUrl` son visibles a cualquier script que corra en la página. Si se carga una librería comprometida, podría leer la URL del backend y redirigir llamadas. Relevante si se agregan scripts de analytics o publicidad en el futuro.

---

**T-3 — No hay HTTPS forzado en el cliente** *(Severidad: Baja)*

El frontend acepta cualquier URL en `window.env.backend.api`. Si el contenedor se despliega mal configurado con `http://`, el token JWT viajaría en claro. No hay validación runtime que lo impida.

---

## R — Repudiation (Repudio)

### ✅ Protecciones en vigor

- Las acciones se envían al backend con JWT firmado — el backend puede atribuir cada operación al usuario
- Keycloak mantiene logs de sesión (login, logout, token refresh)

### ⚠️ Amenazas identificadas

**R-1 — Sin confirmación antes de operaciones destructivas** *(Severidad: Media)*

Las acciones de eliminar (inversión, movimiento, servicio) se ejecutan directamente al hacer click sin un modal de confirmación. El usuario no puede negar la intención, pero:
- Facilita eliminaciones accidentales
- Dificulta argumentar error humano vs. acción intencional

**Mitigación:** Agregar `Modal.confirm` o `Popconfirm` antes de las eliminaciones.

---

**R-2 — Sin audit log en el frontend** *(Severidad: Baja)*

Las acciones del usuario no se registran localmente. Si el backend no tiene auditoría, no hay forma de reconstruir quién hizo qué desde el cliente. Dado que el backend es Spring Boot y suele tener logging, el riesgo neto es bajo, pero depende de la configuración del backend.

---

## I — Information Disclosure (Divulgación de información)

### ✅ Protecciones en vigor

- Tokens en memoria JS (no en `localStorage`, no en cookies sin `HttpOnly`)
- Roles validados desde el JWT, no enviados en parámetros de URL
- `gcTime: 1000 * 60 * 5` — la caché de React Query se purga en 5 minutos

### ⚠️ Amenazas identificadas

**I-1 — `console.debug` con datos de negocio en producción** *(Severidad: Media)*

```ts
// useMovementSubscription.tsx:31
console.debug("📨 Nuevo movimiento recibido:", event);

// WebSocketProvider.tsx:49
console.debug("Iniciando conexión WebSocket a:", baseUrl);

// WebSocketProvider.tsx:66
console.debug(`📡 Re-suscribiendo a ${topic}`);
```

En producción, cualquier usuario con DevTools abierto puede ver movimientos, servicios y datos de workspace en tiempo real en la consola del navegador. Para una app de finanzas personales esto expone montos, categorías e instrumentos de inversión.

**Mitigación:** Compilar con `NODE_ENV=production` y eliminar o condicionar los `console.debug` / `console.log` con una variable de entorno.

---

**I-2 — Token JWT expuesto en URL del WebSocket** *(ya listado en S-1)*

El JWT — que contiene email, roles y sub — aparece en logs de servidor y potencialmente en historial.

---

**I-3 — Versión de la aplicación en el footer** *(Severidad: Baja)*

```tsx
// __root.tsx:63
M-1 ©{new Date().getFullYear()} Created by Mati FV v{module.version}
```

La versión exacta del frontend es visible sin autenticación (visible en cualquier screenshot). Facilita la búsqueda de vulnerabilidades conocidas para esa versión específica. Impacto bajo dado que es una app personal.

---

**I-4 — Detalles de error STOMP en consola** *(Severidad: Baja)*

```ts
// WebSocketProvider.tsx:84-85
console.error("❌ Error STOMP:", frame.headers["message"]);
console.error("Detalles:", frame.body);
```

El `frame.body` de un error STOMP puede contener stack traces del backend o mensajes internos del servidor. Visible en DevTools.

---

## D — Denial of Service (Denegación de servicio)

### ✅ Protecciones en vigor

- `timeout: 5000` en Axios — los requests lentos no bloquean la UI indefinidamente
- `reconnectDelay: 5000` en el cliente STOMP — reconnection con backoff razonable
- `staleTime` configurado — reduce la cantidad de requests redundantes
- `enabled: accountId != null` en hooks — evita requests innecesarios

### ⚠️ Amenazas identificadas

**D-1 — Reconexión WebSocket sin exponential backoff** *(Severidad: Baja)*

```ts
reconnectDelay: 5000, // fijo, no hay backoff
```

Si el servidor WS tiene un problema transitorio, todos los clientes conectados reintentan exactamente a los 5 segundos, causando una avalancha de conexiones simultáneas (thundering herd). Para una app personal con pocos usuarios el impacto es mínimo.

**Mitigación:** Usar `reconnectDelay` como función con jitter aleatorio.

---

**D-2 — `staleTime: Infinity` en catálogos estáticos** *(Severidad: Muy baja)*

`useCurrentUser` y `useInvestmentTypes` tienen `staleTime: Infinity`. Si el backend actualiza estos datos, el cliente no lo reflejará hasta que el usuario recargue la página manualmente. No es DoS técnicamente, pero sí puede causar sesiones inconsistentes si un admin modifica tipos de inversión o roles mientras la sesión está activa.

---

## E — Elevation of Privilege (Elevación de privilegios)

### ✅ Protecciones en vigor

- Roles extraídos del JWT firmado por Keycloak (`tokenParsed.realm_access.roles`)
- Guard ejecutado en `beforeLoad` de cada ruta protegida
- WebSocket solo se conecta después de que Keycloak está autenticado

### ⚠️ Amenazas identificadas

**E-1 — Enforcement de roles solo en el cliente** *(Severidad: Alta — pero es inherente a SPAs)*

```ts
// protectedRouteGuard.tsx:19
const userRoles = auth?.keycloak?.tokenParsed?.realm_access?.roles || [];
```

El guard del router es defensa en profundidad UX — un usuario con conocimientos técnicos puede manipular el estado del router o hacer llamadas directas al backend. **La verdadera autorización debe estar en el backend.** Si el backend no valida roles en sus endpoints, el frontend no es una barrera real.

---

**E-2 — Inconsistencia en el formato de roles** *(Severidad: Media)*

```ts
// protectedRouteGuard.tsx:22
return userRoles.includes(`ROLE_${role}`) || userRoles.includes(role);
```

El guard acepta tanto `"ADMIN"` como `"ROLE_ADMIN"`. Esto indica que en algún momento los tokens tuvieron formatos inconsistentes. Si el backend también hace esta doble verificación, es redundante; si no la hace, podría haber una discrepancia entre lo que el frontend permite y lo que el backend rechaza.

**Mitigación:** Estandarizar un formato en Keycloak y eliminar la verificación dual.

---

**E-3 — Sin validación client-side de workspace ownership** *(Severidad: Baja)*

`useInvestments(accountId)` acepta cualquier `accountId` sin verificar que el usuario sea miembro de ese workspace. La seguridad recae completamente en el backend. Correcto por diseño, pero si el backend tiene un bug de autorización, el frontend no ofrece ninguna capa adicional.

---

## Resumen ejecutivo

| Categoría | Amenaza | Severidad | Estado |
|---|---|---|---|
| Spoofing | Token JWT en query string WS | Media | ⚠️ Abierta |
| Spoofing | Bypass de guard en loading | Baja | ✅ Mitigada parcialmente |
| Tampering | Sin validación de schema WS | Media | ⚠️ Abierta |
| Tampering | `window.env` accesible | Baja | — Aceptable |
| Tampering | Sin HTTPS forzado | Baja | — Depende del deploy |
| Repudiation | Sin confirm en eliminaciones | Media | ⚠️ Abierta |
| Repudiation | Sin audit log frontend | Baja | — Depende del backend |
| Info Disclosure | `console.debug` en producción | Media | ⚠️ Abierta |
| Info Disclosure | Token en URL WS | Media | ⚠️ Abierta (ídem S-1) |
| Info Disclosure | Versión en footer | Baja | — Aceptable |
| DoS | WS sin exponential backoff | Baja | — Aceptable |
| DoS | `staleTime: Infinity` | Muy baja | — Aceptable |
| Elevation | Roles solo en cliente | Alta | ✅ Inherente a SPAs — backend debe validar |
| Elevation | Formato de roles dual | Media | ⚠️ Abierta |
| Elevation | Sin validación de workspace | Baja | ✅ Correcto por diseño |

### Prioridades recomendadas

1. **Alta prioridad**: Mover el token WS de query string a `connectHeaders` (S-1 / I-2)
2. **Media prioridad**: Deshabilitar `console.debug` en producción (I-1)
3. **Media prioridad**: Agregar validación de schema en mensajes WS recibidos (T-1)
4. **Media prioridad**: Agregar `Popconfirm` en eliminaciones (R-1)
5. **Baja prioridad**: Estandarizar formato de roles en Keycloak (E-2)
