# Plan: Implementar Tour de Onboarding con Ant Design

## Objetivo
Mostrar un tour guiado de la UI después del primer login (post-onboarding), explicando cada elemento del navbar. El estado se persiste en backend.

## Decisiones tomadas
- El tour se muestra **solo la primera vez después del onboarding**
- Si el usuario cierra el tour antes de terminar, se marca como visto (no ser intrusivo)
- En mobile **no se muestra** el tour (solo desktop donde está el navbar visible)
- Backend: `PUT /users/me/tour` para marcar el tour como visto
- El campo `hasSeenTour` viene del endpoint `/users/me`

---

## Cambios a implementar

### 1. Actualizar modelo `CurrentUser`
**Archivo:** `src/models/CurrentUser.ts`

```ts
export interface CurrentUser {
  id: number | null;
  email: string | null;
  isFirstLogin: boolean;
  userType: string | null;
  hasSeenTour: boolean;  // <-- NUEVO
}
```

---

### 2. Crear API para marcar el tour como visto
**Archivo nuevo:** `src/apis/tour/TourApi.ts`

```ts
import { api } from "../axios";

const BASE_PATH = "users/me/tour";

export const markTourAsSeen = (): Promise<void> =>
  api.put(BASE_PATH).then(() => undefined);
```

---

### 3. Crear hook `useMarkTourSeen`
**Archivo nuevo:** `src/apis/hooks/useTour.ts`

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markTourAsSeen } from "../tour/TourApi";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";
import type { CurrentUser } from "../../models/CurrentUser";

export const useMarkTourSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTourAsSeen,
    onSuccess: () => {
      // Actualizar optimistamente el cache
      queryClient.setQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY, (old) =>
        old ? { ...old, hasSeenTour: true } : old,
      );
    },
  });
};
```

---

### 4. Crear componente `NavTour`
**Archivo nuevo:** `src/components/NavTour.tsx`

```tsx
import { Tour } from "antd";
import type { TourProps } from "antd";
import { useMarkTourSeen } from "../apis/hooks/useTour";

type NavTourProps = {
  open: boolean;
  onClose: () => void;
  refs: {
    balance: React.RefObject<HTMLButtonElement>;
    servicios: React.RefObject<HTMLButtonElement>;
    presupuestos: React.RefObject<HTMLButtonElement>;
    gastos: React.RefObject<HTMLButtonElement>;
    ajustes: React.RefObject<HTMLButtonElement>;
    admin?: React.RefObject<HTMLButtonElement>;
  };
};

const TOUR_STEPS: Record<string, { title: string; description: string }> = {
  balance: {
    title: "Balance",
    description: "Visualiza el resumen de tus ingresos y gastos. Gráficos por categoría, grupo y evolución mensual.",
  },
  servicios: {
    title: "Servicios",
    description: "Gestiona tus suscripciones y servicios recurrentes. Lleva control de pagos mensuales.",
  },
  presupuestos: {
    title: "Presupuestos",
    description: "Define presupuestos mensuales por categoría y monitorea tu progreso de gastos.",
  },
  gastos: {
    title: "Gastos",
    description: "Registra y consulta todos tus movimientos. Filtra por tipo, banco, categoría y más.",
  },
  ajustes: {
    title: "Ajustes",
    description: "Configura tu cuenta, moneda por defecto, categorías, bancos y administra tus grupos.",
  },
  admin: {
    title: "Administración",
    description: "Panel de administración del sistema. Gestión avanzada de usuarios y configuración.",
  },
};

export default function NavTour({ open, onClose, refs }: NavTourProps) {
  const { mutate: markSeen } = useMarkTourSeen();

  const handleClose = () => {
    markSeen();
    onClose();
  };

  const steps: TourProps["steps"] = [
    { target: () => refs.balance.current, ...TOUR_STEPS.balance },
    { target: () => refs.servicios.current, ...TOUR_STEPS.servicios },
    { target: () => refs.presupuestos.current, ...TOUR_STEPS.presupuestos },
    { target: () => refs.gastos.current, ...TOUR_STEPS.gastos },
    { target: () => refs.ajustes.current, ...TOUR_STEPS.ajustes },
  ];

  // Agregar paso de Admin solo si existe el ref
  if (refs.admin?.current) {
    steps.push({ target: () => refs.admin!.current, ...TOUR_STEPS.admin });
  }

  return (
    <Tour
      open={open}
      onClose={handleClose}
      onFinish={handleClose}
      steps={steps}
      indicatorsRender={(current, total) => (
        <span>
          {current + 1} / {total}
        </span>
      )}
    />
  );
}
```

---

### 5. Modificar `NavHeader.tsx`
**Archivo:** `src/components/NavHeader.tsx`

#### 5.1 Agregar imports
```tsx
import { useState, useRef, useCallback } from "react";
import NavTour from "./NavTour";
```

#### 5.2 Agregar refs en NavSlider
Modificar `NavSlider` para aceptar un callback que registre los refs:

```tsx
interface NavSliderProps {
  items: SideBarItem[];
  activeKey: string;
  onSelect: (item: SideBarItem) => void;
  token: ReturnType<typeof theme.useToken>["token"];
  onRefRegister?: (key: string, el: HTMLButtonElement | null) => void;  // NUEVO
}

function NavSlider({ items, activeKey, onSelect, token, onRefRegister }: NavSliderProps) {
  // ... existing code ...
  
  return (
    <nav /* ... */>
      {items.map((item, idx) => {
        // ...
        return (
          <button
            key={item.key}
            ref={(el) => {
              itemRefs.current[idx] = el;
              onRefRegister?.(item.key, el);  // NUEVO: registrar ref
            }}
            // ... rest of button props
          >
```

#### 5.3 En NavHeader, agregar estado y refs para el tour
```tsx
export default function NavHeader() {
  // ... existing hooks ...
  const { data: currentUser } = useCurrentUser();
  
  // NUEVO: Estado y refs para el tour
  const [tourOpen, setTourOpen] = useState(false);
  const navRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  const handleRefRegister = useCallback((key: string, el: HTMLButtonElement | null) => {
    navRefs.current[key] = el;
  }, []);

  // NUEVO: Mostrar tour cuando corresponda (solo desktop, hasSeenTour === false)
  const shouldShowTour = !isMobile && currentUser?.hasSeenTour === false;
  
  useEffect(() => {
    if (shouldShowTour && !tourOpen) {
      // Pequeño delay para que el DOM esté listo
      const timer = setTimeout(() => setTourOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, tourOpen]);
  
  // ... rest of component ...

  return (
    <>
      <Header /* ... */>
        {/* ... existing mobile/desktop rendering ... */}
        
        {/* Desktop: pasar onRefRegister a NavSlider */}
        {!isMobile && (
          <NavSlider
            items={visibleItems}
            activeKey={activeKey}
            onSelect={handleClick}
            token={token}
            onRefRegister={handleRefRegister}  // NUEVO
          />
        )}
      </Header>

      {/* Mobile Drawer - sin cambios */}
      
      {/* NUEVO: Tour component */}
      {shouldShowTour && (
        <NavTour
          open={tourOpen}
          onClose={() => setTourOpen(false)}
          refs={{
            balance: { current: navRefs.current.balance },
            servicios: { current: navRefs.current.servicios },
            presupuestos: { current: navRefs.current.budgets },
            gastos: { current: navRefs.current.expenses },
            ajustes: { current: navRefs.current.settings },
            admin: navRefs.current.admin ? { current: navRefs.current.admin } : undefined,
          }}
        />
      )}
    </>
  );
}
```

---

### 6. Tests

#### 6.1 Test del hook `useTour`
**Archivo nuevo:** `tests/apis/hooks/useTour.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMarkTourSeen } from "../../../src/apis/hooks/useTour";
import { createWrapper } from "../../test-utils";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

describe("useMarkTourSeen", () => {
  beforeEach(() => {
    server.use(
      http.put("*/users/me/tour", () => {
        return HttpResponse.json(null, { status: 204 });
      }),
    );
  });

  it("should call PUT /users/me/tour on mutate", async () => {
    const { result } = renderHook(() => useMarkTourSeen(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should update currentUser cache with hasSeenTour: true", async () => {
    // Test que verifica la actualización optimista del cache
    // ...
  });
});
```

#### 6.2 Test del componente `NavTour`
**Archivo nuevo:** `tests/components/NavTour.test.tsx`

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NavTour from "../../src/components/NavTour";
import { createWrapper } from "../test-utils";

// Mock del hook
vi.mock("../../src/apis/hooks/useTour", () => ({
  useMarkTourSeen: () => ({
    mutate: vi.fn(),
  }),
}));

describe("NavTour", () => {
  const mockRefs = {
    balance: { current: document.createElement("button") },
    servicios: { current: document.createElement("button") },
    presupuestos: { current: document.createElement("button") },
    gastos: { current: document.createElement("button") },
    ajustes: { current: document.createElement("button") },
  };

  it("should render tour when open is true", () => {
    render(
      <NavTour open={true} onClose={vi.fn()} refs={mockRefs} />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Balance")).toBeInTheDocument();
  });

  it("should call onClose and markSeen when tour is closed", async () => {
    const onClose = vi.fn();
    render(
      <NavTour open={true} onClose={onClose} refs={mockRefs} />,
      { wrapper: createWrapper() },
    );

    // Simular cerrar el tour
    // ...
  });

  it("should include admin step when admin ref is provided", () => {
    const refsWithAdmin = {
      ...mockRefs,
      admin: { current: document.createElement("button") },
    };
    
    render(
      <NavTour open={true} onClose={vi.fn()} refs={refsWithAdmin} />,
      { wrapper: createWrapper() },
    );

    // Navegar hasta el último paso y verificar que Admin está presente
    // ...
  });
});
```

---

## Estructura de archivos final

```
src/
├── apis/
│   ├── hooks/
│   │   ├── useCurrentUser.ts    (sin cambios)
│   │   └── useTour.ts           (NUEVO)
│   └── tour/
│       └── TourApi.ts           (NUEVO)
├── components/
│   ├── NavHeader.tsx            (modificado)
│   └── NavTour.tsx              (NUEVO)
└── models/
    └── CurrentUser.ts           (modificado)

tests/
├── apis/
│   └── hooks/
│       └── useTour.test.ts      (NUEVO)
└── components/
    └── NavTour.test.tsx         (NUEVO)
```

---

## Flujo de usuario final

1. Usuario completa onboarding → backend marca `isFirstLogin: false`
2. Usuario es redirigido a `/` (home)
3. `NavHeader` detecta que `hasSeenTour === false` y `!isMobile`
4. Después de 500ms (para que el DOM esté listo), se muestra el `Tour`
5. Usuario navega por los pasos o cierra el tour
6. Al cerrar/completar → se llama a `PUT /users/me/tour`
7. Cache de `current-user` se actualiza optimistamente → `hasSeenTour: true`
8. El tour no se muestra más

---

## Notas adicionales

- Los textos de descripción de cada paso están en español para mantener consistencia con la UI
- El tour usa `indicatorsRender` para mostrar "1 / 5" en lugar de dots
- Se usa actualización optimista del cache para mejor UX (no esperar al backend)
