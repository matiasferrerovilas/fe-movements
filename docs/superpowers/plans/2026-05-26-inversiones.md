# Inversiones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/inversiones` route for tracking investment portfolio — dashboard KPIs (total invertido, valor actual, ganancia/pérdida) and a table of investments per workspace, backed by a REST API and WebSocket price updates.

**Architecture:** New feature follows existing patterns — API functions in `src/apis/investment/InvestmentApi.ts`, hooks in `src/apis/hooks/`, WebSocket subscription in `src/apis/websocket/useInvestmentsSubscription.tsx`, components in `src/components/investments/`, route at `src/routes/inversiones.tsx`. The backend owns `valorActual` (updated by price connectors); the frontend calculates gain/loss as `valorActual - montoInvertido`.

**Tech Stack:** React 19, TypeScript strict, TanStack Query v5, TanStack Router v1 (file-based), Ant Design 6, DayJS + relativeTime plugin, Vitest + MSW

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/models/InvestmentType.ts` | Create | Interface for investment type catalog |
| `src/models/Investment.ts` | Create | Investment interface + form types |
| `src/apis/websocket/EventWrapper.ts` | Modify | Add `INVESTMENT_UPDATED` event type |
| `src/apis/investment/InvestmentApi.ts` | Create | REST calls for investments and types |
| `src/apis/hooks/useInvestmentTypes.tsx` | Create | Query hook for investment types catalog |
| `src/apis/hooks/useInvestments.tsx` | Create | Query + mutation hooks for investments |
| `src/apis/websocket/useInvestmentsSubscription.tsx` | Create | WebSocket hook for price updates |
| `src/components/investments/InvestmentDashboard.tsx` | Create | 4 KPI summary cards |
| `src/components/investments/InvestmentTable.tsx` | Create | Investments table with edit/delete |
| `src/components/investments/InvestmentForm.tsx` | Create | Create/edit modal form |
| `src/routes/inversiones.tsx` | Create | Route component wiring everything together |
| `src/components/NavHeader.tsx` | Modify | Add "Inversiones" nav item |
| `src/main.tsx` | Modify | Register dayjs relativeTime plugin |
| `tests/setup.ts` | Modify | Register dayjs relativeTime plugin for tests |
| `tests/apis/hooks/useInvestmentTypes.test.tsx` | Create | Hook tests |
| `tests/apis/hooks/useInvestments.test.tsx` | Create | Hook tests |
| `tests/apis/websocket/useInvestmentsSubscription.test.tsx` | Create | Subscription tests |
| `tests/components/investments/InvestmentDashboard.test.tsx` | Create | Component tests |
| `tests/components/investments/InvestmentTable.test.tsx` | Create | Component tests |
| `tests/components/investments/InvestmentForm.test.tsx` | Create | Component tests |

---

## Task 1: Models + EventWrapper

**Files:**
- Create: `src/models/InvestmentType.ts`
- Create: `src/models/Investment.ts`
- Modify: `src/apis/websocket/EventWrapper.ts`

- [ ] **Step 1: Create InvestmentType model**

```ts
// src/models/InvestmentType.ts
export interface InvestmentType {
  id: number;
  description: string;
  iconName?: string | null;
  iconColor?: string | null;
}
```

- [ ] **Step 2: Create Investment model**

```ts
// src/models/Investment.ts
import type { Currency } from "./Currency";
import type { InvestmentType } from "./InvestmentType";
import type { AccountWithoutMembers } from "./UserWorkspace";

export interface Investment {
  id: number;
  instrumento: string;
  tipo: InvestmentType;
  montoInvertido: number;
  valorActual: number;
  fechaInversion: string;
  moneda: Currency;
  account: AccountWithoutMembers;
}

export interface CreateInvestmentForm {
  instrumento: string;
  tipoId: number;
  montoInvertido: number;
  currency: string;
  fechaInversion: Date;
}

export interface UpdateInvestmentForm {
  instrumento?: string;
  tipoId?: number;
  montoInvertido?: number;
  currency?: string;
  fechaInversion?: Date;
}
```

- [ ] **Step 3: Add INVESTMENT_UPDATED to EventWrapper**

In `src/apis/websocket/EventWrapper.ts`, add the new event type to both the object and the type alias:

```ts
export interface EventWrapper<T> {
  eventType: EventType;
  message: T;
}

export const EventType = {
  MOVEMENT_ADDED: "MOVEMENT_ADDED",
  MOVEMENT_DELETED: "MOVEMENT_DELETED",
  SERVICE_PAID: "SERVICE_PAID",
  SERVICE_UPDATED: "SERVICE_UPDATED",
  SERVICE_DELETED: "SERVICE_DELETED",
  INVITATION_CONFIRMED_REJECTED: "INVITATION_CONFIRMED_REJECTED",
  INVITATION_ADDED: "INVITATION_ADDED",
  MEMBERSHIP_UPDATED: "MEMBERSHIP_UPDATED",
  ACCOUNT_LEFT: "ACCOUNT_LEFT",
  INVESTMENT_UPDATED: "INVESTMENT_UPDATED",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];
```

- [ ] **Step 4: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/models/InvestmentType.ts src/models/Investment.ts src/apis/websocket/EventWrapper.ts
git commit -m "feat: add Investment models and INVESTMENT_UPDATED event type"
```

---

## Task 2: Investment API

**Files:**
- Create: `src/apis/investment/InvestmentApi.ts`

- [ ] **Step 1: Create the API file**

```ts
// src/apis/investment/InvestmentApi.ts
import dayjs from "dayjs";
import type { Investment, CreateInvestmentForm, UpdateInvestmentForm } from "../../models/Investment";
import type { InvestmentType } from "../../models/InvestmentType";
import { api } from "../axios";

const BASE_PATH = "/investments";
const TYPES_PATH = "/investment-types";

export const getInvestmentsApi = (accountId: number) =>
  api
    .get<Investment[]>(BASE_PATH, { params: { accountId } })
    .then((r) => r.data);

export const createInvestmentApi = (form: CreateInvestmentForm, accountId: number) => {
  const payload = {
    ...form,
    fechaInversion: dayjs(form.fechaInversion).format("YYYY-MM-DD"),
    accountId,
  };
  return api.post<Investment>(BASE_PATH, payload).then((r) => r.data);
};

export const updateInvestmentApi = (id: number, form: UpdateInvestmentForm) => {
  const payload = {
    ...form,
    ...(form.fechaInversion && {
      fechaInversion: dayjs(form.fechaInversion).format("YYYY-MM-DD"),
    }),
  };
  return api.put<Investment>(`${BASE_PATH}/${id}`, payload).then((r) => r.data);
};

export const deleteInvestmentApi = (id: number) =>
  api.delete(`${BASE_PATH}/${id}`).then((r) => r.data);

export const getInvestmentTypesApi = () =>
  api.get<InvestmentType[]>(TYPES_PATH).then((r) => r.data);
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/apis/investment/InvestmentApi.ts
git commit -m "feat: add InvestmentApi REST functions"
```

---

## Task 3: useInvestmentTypes hook + tests

**Files:**
- Create: `src/apis/hooks/useInvestmentTypes.tsx`
- Create: `tests/apis/hooks/useInvestmentTypes.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/apis/hooks/useInvestmentTypes.test.tsx
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { InvestmentType } from "../../../src/models/InvestmentType";
import { useInvestmentTypes } from "../../../src/apis/hooks/useInvestmentTypes";

const mockTypes: InvestmentType[] = [
  { id: 1, description: "Acciones", iconName: "RiseOutlined", iconColor: "#52c41a" },
  { id: 2, description: "FCI", iconName: "FundOutlined", iconColor: "#1677ff" },
  { id: 3, description: "Crypto", iconName: "CryptoOutlined", iconColor: "#faad14" },
];

const server = setupServer(
  http.get("http://localhost:8080/investment-types", () =>
    HttpResponse.json(mockTypes),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useInvestmentTypes", () => {
  it("calls GET /investment-types and returns the list", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].description).toBe("Acciones");
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/investment-types", () =>
        HttpResponse.json({ message: "Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("returns empty array when server returns empty list", async () => {
    server.use(
      http.get("http://localhost:8080/investment-types", () =>
        HttpResponse.json([]),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("data is not stale immediately (staleTime Infinity)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/apis/hooks/useInvestmentTypes.test.tsx
```

Expected: FAIL — `useInvestmentTypes` not found.

- [ ] **Step 3: Implement the hook**

```ts
// src/apis/hooks/useInvestmentTypes.tsx
import { useQuery } from "@tanstack/react-query";
import { getInvestmentTypesApi } from "../investment/InvestmentApi";

const INVESTMENT_TYPES_QUERY_KEY = "investment-types" as const;

export const useInvestmentTypes = () =>
  useQuery({
    queryKey: [INVESTMENT_TYPES_QUERY_KEY],
    queryFn: () => getInvestmentTypesApi(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/apis/hooks/useInvestmentTypes.test.tsx
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apis/hooks/useInvestmentTypes.tsx tests/apis/hooks/useInvestmentTypes.test.tsx
git commit -m "feat: add useInvestmentTypes hook"
```

---

## Task 4: useInvestments hook + tests

**Files:**
- Create: `src/apis/hooks/useInvestments.tsx`
- Create: `tests/apis/hooks/useInvestments.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/apis/hooks/useInvestments.test.tsx
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Investment } from "../../../src/models/Investment";
import {
  useInvestments,
  useCreateInvestment,
  useUpdateInvestment,
  useDeleteInvestment,
} from "../../../src/apis/hooks/useInvestments";

function makeInvestment(id: number): Investment {
  return {
    id,
    instrumento: `TICKER${id}`,
    tipo: { id: 1, description: "Acciones" },
    montoInvertido: 1000,
    valorActual: 1200,
    fechaInversion: "2025-01-01",
    moneda: { id: 1, symbol: "USD", description: "Dólar" },
    account: { id: 10, name: "Familia" },
  };
}

const mockInvestments: Investment[] = [makeInvestment(1), makeInvestment(2)];

const server = setupServer(
  http.get("http://localhost:8080/investments", () =>
    HttpResponse.json(mockInvestments),
  ),
  http.post("http://localhost:8080/investments", () =>
    HttpResponse.json(makeInvestment(3), { status: 201 }),
  ),
  http.put("http://localhost:8080/investments/:id", () =>
    HttpResponse.json(makeInvestment(1)),
  ),
  http.delete("http://localhost:8080/investments/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useInvestments", () => {
  it("calls GET /investments?accountId=10 and returns the list", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost:8080/investments", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockInvestments);
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestments(10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(capturedUrl).toContain("accountId=10");
    expect(result.current.data).toHaveLength(2);
  });

  it("is disabled when accountId is undefined", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestments(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("returns error state when request fails", async () => {
    server.use(
      http.get("http://localhost:8080/investments", () =>
        HttpResponse.json({ message: "Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestments(10), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("data is not stale immediately (staleTime 1 min)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestments(10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });
});

describe("useCreateInvestment", () => {
  it("calls POST /investments with correct payload", async () => {
    let capturedBody: unknown;
    server.use(
      http.post("http://localhost:8080/investments", async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(makeInvestment(3), { status: 201 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCreateInvestment(10), { wrapper });

    await act(async () => {
      result.current.mutate({
        instrumento: "AAPL",
        tipoId: 1,
        montoInvertido: 500,
        currency: "USD",
        fechaInversion: new Date("2025-06-01"),
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedBody).toMatchObject({
      instrumento: "AAPL",
      tipoId: 1,
      montoInvertido: 500,
      currency: "USD",
      fechaInversion: "2025-06-01",
      accountId: 10,
    });
  });

  it("invalidates investments query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateInvestment(10), { wrapper });

    await act(async () => {
      result.current.mutate({
        instrumento: "AAPL",
        tipoId: 1,
        montoInvertido: 500,
        currency: "USD",
        fechaInversion: new Date("2025-06-01"),
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["investments"] });
  });
});

describe("useUpdateInvestment", () => {
  it("calls PUT /investments/:id with correct payload", async () => {
    let capturedId = "";
    let capturedBody: unknown;
    server.use(
      http.put("http://localhost:8080/investments/:id", async ({ params, request }) => {
        capturedId = params.id as string;
        capturedBody = await request.json();
        return HttpResponse.json(makeInvestment(1));
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useUpdateInvestment(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, form: { instrumento: "MSFT", montoInvertido: 800 } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedId).toBe("1");
    expect(capturedBody).toMatchObject({ instrumento: "MSFT", montoInvertido: 800 });
  });

  it("invalidates investments query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateInvestment(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, form: { instrumento: "MSFT" } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["investments"] });
  });
});

describe("useDeleteInvestment", () => {
  it("calls DELETE /investments/:id", async () => {
    let capturedId = "";
    server.use(
      http.delete("http://localhost:8080/investments/:id", ({ params }) => {
        capturedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteInvestment(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedId).toBe("1");
  });

  it("invalidates investments query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteInvestment(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["investments"] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/apis/hooks/useInvestments.test.tsx
```

Expected: FAIL — `useInvestments` not found.

- [ ] **Step 3: Implement the hook**

```ts
// src/apis/hooks/useInvestments.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvestmentApi,
  deleteInvestmentApi,
  getInvestmentsApi,
  updateInvestmentApi,
} from "../investment/InvestmentApi";
import type { CreateInvestmentForm, UpdateInvestmentForm } from "../../models/Investment";

const INVESTMENTS_QUERY_KEY = "investments" as const;

export const useInvestments = (accountId: number | undefined) =>
  useQuery({
    queryKey: [INVESTMENTS_QUERY_KEY, accountId],
    queryFn: () => getInvestmentsApi(accountId!),
    enabled: accountId != null,
    staleTime: 1000 * 60,
  });

export const useCreateInvestment = (
  accountId: number,
  options?: { onSuccess?: () => void },
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateInvestmentForm) => createInvestmentApi(form, accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      options?.onSuccess?.();
    },
  });
};

export const useUpdateInvestment = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: number; form: UpdateInvestmentForm }) =>
      updateInvestmentApi(id, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      options?.onSuccess?.();
    },
  });
};

export const useDeleteInvestment = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInvestmentApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      options?.onSuccess?.();
    },
  });
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/apis/hooks/useInvestments.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apis/hooks/useInvestments.tsx tests/apis/hooks/useInvestments.test.tsx
git commit -m "feat: add useInvestments hook with CRUD mutations"
```

---

## Task 5: useInvestmentsSubscription + tests

**Files:**
- Create: `src/apis/websocket/useInvestmentsSubscription.tsx`
- Create: `tests/apis/websocket/useInvestmentsSubscription.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/apis/websocket/useInvestmentsSubscription.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Membership } from "../../../src/models/UserWorkspace";
import type { EventWrapper } from "../../../src/apis/websocket/EventWrapper";
import { EventType } from "../../../src/apis/websocket/EventWrapper";
import { useInvestmentsSubscription } from "../../../src/apis/websocket/useInvestmentsSubscription";

vi.mock("../../../src/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useWorkspaces } from "../../../src/apis/hooks/useWorkspaces";
import { useWebSocket } from "../../../src/apis/websocket/WebSocketProvider";

function makeWsMock() {
  const subscriptions = new Map<string, (event: EventWrapper<unknown>) => void>();
  return {
    isConnected: true,
    subscribe: vi.fn((topic: string, cb: (e: EventWrapper<unknown>) => void) => {
      subscriptions.set(topic, cb);
    }),
    unsubscribe: vi.fn((topic: string) => {
      subscriptions.delete(topic);
    }),
    trigger: (topic: string, event: EventWrapper<unknown>) => {
      subscriptions.get(topic)?.(event);
    },
    subscriptions,
  };
}

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const memberships: Membership[] = [
  { workspaceId: 10, membershipId: 1, workspaceName: "Familia", role: "ADMIN" },
  { workspaceId: 20, membershipId: 2, workspaceName: "Trabajo", role: "FAMILY" },
];

describe("useInvestmentsSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wsMock = makeWsMock();
    vi.mocked(useWorkspaces).mockReturnValue({
      data: memberships,
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);
    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to investment topics for each membership on mount", () => {
    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/investments/${memberships[0].workspaceId}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/investments/${memberships[1].workspaceId}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when memberships list is empty", () => {
    vi.mocked(useWorkspaces).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from all topics on unmount", () => {
    const { unmount } = renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(2);
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/investments/${memberships[0].workspaceId}/update`,
      expect.any(Function),
    );
  });

  it("invalidates investments query on INVESTMENT_UPDATED", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<unknown> = {
      eventType: EventType.INVESTMENT_UPDATED,
      message: {},
    };

    act(() => {
      wsMock.trigger(`/topic/investments/${memberships[0].workspaceId}/update`, event);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["investments"] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/apis/websocket/useInvestmentsSubscription.test.tsx
```

Expected: FAIL — `useInvestmentsSubscription` not found.

- [ ] **Step 3: Implement the subscription hook**

```ts
// src/apis/websocket/useInvestmentsSubscription.tsx
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { useWorkspaces } from "../hooks/useWorkspaces";
import { EventType, type EventWrapper } from "./EventWrapper";

const INVESTMENTS_QUERY_KEY = "investments" as const;

export const useInvestmentsSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useWorkspaces();

  const topics = useMemo(
    () => memberships.map((m) => `/topic/investments/${m.workspaceId}/update`),
    [memberships],
  );

  const callbackRef = useRef<((event: EventWrapper<unknown>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<unknown>) => {
      if (event.eventType === EventType.INVESTMENT_UPDATED) {
        void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      }
    };
  });

  useEffect(() => {
    if (!ws.isConnected || topics.length === 0) return;

    const callback = (event: EventWrapper<unknown>) => callbackRef.current!(event);
    topics.forEach((topic) => ws.subscribe(topic, callback));
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, topics]);
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/apis/websocket/useInvestmentsSubscription.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apis/websocket/useInvestmentsSubscription.tsx tests/apis/websocket/useInvestmentsSubscription.test.tsx
git commit -m "feat: add useInvestmentsSubscription WebSocket hook"
```

---

## Task 6: dayjs relativeTime plugin setup

**Files:**
- Modify: `src/main.tsx`
- Modify: `tests/setup.ts`

`dayjs().fromNow()` requires the `relativeTime` plugin. It must be registered once before use.

- [ ] **Step 1: Register plugin in main.tsx**

Add these two lines after the existing imports in `src/main.tsx`:

```ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");
```

The full top of the file should look like:

```ts
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Keycloak from "keycloak-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import App from "./App";
import { AuthProvider } from "./apis/auth/AuthProvider";

dayjs.extend(relativeTime);
dayjs.locale("es");
```

- [ ] **Step 2: Register plugin in tests/setup.ts**

Add these lines at the top of `tests/setup.ts` (before the `@testing-library/jest-dom` import):

```ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");

import "@testing-library/jest-dom";
```

- [ ] **Step 3: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx tests/setup.ts
git commit -m "feat: register dayjs relativeTime plugin for inversiones"
```

---

## Task 7: InvestmentDashboard component + tests

**Files:**
- Create: `src/components/investments/InvestmentDashboard.tsx`
- Create: `tests/components/investments/InvestmentDashboard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/investments/InvestmentDashboard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Investment } from "../../../src/models/Investment";
import { InvestmentDashboard } from "../../../src/components/investments/InvestmentDashboard";

function makeInvestment(id: number, montoInvertido: number, valorActual: number): Investment {
  return {
    id,
    instrumento: `TICKER${id}`,
    tipo: { id: 1, description: "Acciones" },
    montoInvertido,
    valorActual,
    fechaInversion: "2025-01-01",
    moneda: { id: 1, symbol: "USD", description: "Dólar" },
    account: { id: 10, name: "Familia" },
  };
}

describe("InvestmentDashboard", () => {
  it("renders all four KPI card labels", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);

    expect(screen.getByText("Total invertido")).toBeInTheDocument();
    expect(screen.getByText("Valor actual")).toBeInTheDocument();
    expect(screen.getByText("Ganancia / Pérdida")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento")).toBeInTheDocument();
  });

  it("shows zero totals when investments list is empty", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);

    // data-testid wrappers around each Statistic
    expect(screen.getByTestId("total-invertido")).toHaveTextContent("0");
    expect(screen.getByTestId("valor-actual")).toHaveTextContent("0");
  });

  it("calculates total invertido as sum of montoInvertido", () => {
    const investments = [
      makeInvestment(1, 1000, 1200),
      makeInvestment(2, 500, 600),
    ];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    // "1,500" or "1500" — toHaveTextContent matches substrings
    expect(screen.getByTestId("total-invertido")).toHaveTextContent("1");
    expect(screen.getByTestId("total-invertido")).toHaveTextContent("500");
  });

  it("calculates valor actual as sum of valorActual", () => {
    const investments = [
      makeInvestment(1, 1000, 1200),
      makeInvestment(2, 500, 600),
    ];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("valor-actual")).toHaveTextContent("1");
    expect(screen.getByTestId("valor-actual")).toHaveTextContent("800");
  });

  it("calculates ganancia as valorActual - montoInvertido", () => {
    const investments = [makeInvestment(1, 1000, 1200)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("ganancia")).toHaveTextContent("200");
  });

  it("calculates rendimiento as percentage", () => {
    const investments = [makeInvestment(1, 1000, 1200)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("rendimiento")).toHaveTextContent("20");
  });

  it("shows rendimiento as 0 when no investments", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);

    expect(screen.getByTestId("rendimiento")).toHaveTextContent("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/investments/InvestmentDashboard.test.tsx
```

Expected: FAIL — `InvestmentDashboard` not found.

- [ ] **Step 3: Implement InvestmentDashboard**

```tsx
// src/components/investments/InvestmentDashboard.tsx
import { useMemo } from "react";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import type { Investment } from "../../models/Investment";

interface InvestmentDashboardProps {
  investments: Investment[];
  isFetching: boolean;
}

export function InvestmentDashboard({ investments, isFetching }: InvestmentDashboardProps) {
  const totalInvertido = useMemo(
    () => investments.reduce((sum, inv) => sum + inv.montoInvertido, 0),
    [investments],
  );

  const valorActual = useMemo(
    () => investments.reduce((sum, inv) => sum + inv.valorActual, 0),
    [investments],
  );

  const ganancia = valorActual - totalInvertido;
  const rendimiento = totalInvertido > 0 ? (ganancia / totalInvertido) * 100 : 0;
  const isPositive = ganancia >= 0;

  if (isFetching) {
    return <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="total-invertido">
            <Statistic
              title="Total invertido"
              value={totalInvertido}
              precision={2}
            />
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="valor-actual">
            <Statistic
              title="Valor actual"
              value={valorActual}
              precision={2}
            />
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="ganancia">
            <Statistic
              title="Ganancia / Pérdida"
              value={Math.abs(ganancia)}
              precision={2}
              valueStyle={{ color: isPositive ? "#3f8600" : "#cf1322" }}
              prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="rendimiento">
            <Statistic
              title="Rendimiento"
              value={Math.abs(rendimiento)}
              precision={2}
              suffix="%"
              valueStyle={{ color: isPositive ? "#3f8600" : "#cf1322" }}
              prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/components/investments/InvestmentDashboard.test.tsx
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/investments/InvestmentDashboard.tsx tests/components/investments/InvestmentDashboard.test.tsx
git commit -m "feat: add InvestmentDashboard KPI cards component"
```

---

## Task 8: InvestmentTable component + tests

**Files:**
- Create: `src/components/investments/InvestmentTable.tsx`
- Create: `tests/components/investments/InvestmentTable.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/investments/InvestmentTable.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Investment } from "../../../src/models/Investment";
import { InvestmentTable } from "../../../src/components/investments/InvestmentTable";

function makeInvestment(id: number): Investment {
  return {
    id,
    instrumento: `TICKER${id}`,
    tipo: { id: 1, description: "Acciones", iconColor: "#52c41a" },
    montoInvertido: 1000,
    valorActual: 1200,
    fechaInversion: "2025-01-15",
    moneda: { id: 1, symbol: "USD", description: "Dólar" },
    account: { id: 10, name: "Familia" },
  };
}

describe("InvestmentTable", () => {
  it("renders a row for each investment", () => {
    const investments = [makeInvestment(1), makeInvestment(2)];
    render(
      <InvestmentTable
        investments={investments}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("TICKER1")).toBeInTheDocument();
    expect(screen.getByText("TICKER2")).toBeInTheDocument();
  });

  it("shows tipo description for each row", () => {
    render(
      <InvestmentTable
        investments={[makeInvestment(1)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("calls onEdit with the correct investment when edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const investment = makeInvestment(1);

    render(
      <InvestmentTable
        investments={[investment]}
        isFetching={false}
        onEdit={onEdit}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(investment);
  });

  it("calls onDelete with the correct id when delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <InvestmentTable
        investments={[makeInvestment(5)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={onDelete}
        isDeleting={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith(5);
  });

  it("renders empty state when investments list is empty", () => {
    render(
      <InvestmentTable
        investments={[]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText(/sin inversiones/i)).toBeInTheDocument();
  });

  it("shows positive gain in green color class", () => {
    render(
      <InvestmentTable
        investments={[makeInvestment(1)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    const gainCell = screen.getByTestId("gp-1");
    expect(gainCell).toHaveStyle({ color: "#3f8600" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/investments/InvestmentTable.test.tsx
```

Expected: FAIL — `InvestmentTable` not found.

- [ ] **Step 3: Implement InvestmentTable**

```tsx
// src/components/investments/InvestmentTable.tsx
import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import dayjs from "dayjs";
import type { Investment } from "../../models/Investment";

const { Text } = Typography;

interface InvestmentTableProps {
  investments: Investment[];
  isFetching: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function InvestmentTable({
  investments,
  isFetching,
  onEdit,
  onDelete,
  isDeleting,
}: InvestmentTableProps) {
  const columns: ColumnsType<Investment> = [
    {
      title: "Instrumento",
      dataIndex: "instrumento",
      key: "instrumento",
    },
    {
      title: "Tipo",
      key: "tipo",
      render: (_, record) => (
        <Tag color={record.tipo.iconColor ?? undefined}>{record.tipo.description}</Tag>
      ),
    },
    {
      title: "Monto invertido",
      key: "montoInvertido",
      render: (_, record) => (
        <Text>
          {record.moneda.symbol} {record.montoInvertido.toLocaleString("es-AR")}
        </Text>
      ),
    },
    {
      title: "Valor actual",
      key: "valorActual",
      render: (_, record) => (
        <Text>
          {record.moneda.symbol} {record.valorActual.toLocaleString("es-AR")}
        </Text>
      ),
    },
    {
      title: "G / P",
      key: "gp",
      render: (_, record) => {
        const gp = record.valorActual - record.montoInvertido;
        const isPositive = gp >= 0;
        return (
          <Text
            data-testid={`gp-${record.id}`}
            style={{ color: isPositive ? "#3f8600" : "#cf1322" }}
          >
            {isPositive ? "+" : ""}
            {record.moneda.symbol} {gp.toLocaleString("es-AR")}
          </Text>
        );
      },
    },
    {
      title: "Rendimiento",
      key: "rendimiento",
      render: (_, record) => {
        const gp = record.valorActual - record.montoInvertido;
        const pct = record.montoInvertido > 0 ? (gp / record.montoInvertido) * 100 : 0;
        const isPositive = pct >= 0;
        return (
          <Text style={{ color: isPositive ? "#3f8600" : "#cf1322" }}>
            {isPositive ? "+" : ""}
            {pct.toFixed(2)}%
          </Text>
        );
      },
    },
    {
      title: "Fecha",
      key: "fecha",
      render: (_, record) => dayjs(record.fechaInversion).format("DD/MM/YYYY"),
    },
    {
      title: "Hace cuánto",
      key: "haceCuanto",
      render: (_, record) => dayjs(record.fechaInversion).fromNow(),
    },
    {
      title: "",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              aria-label="editar"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              aria-label="eliminar"
              loading={isDeleting}
              onClick={() => onDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={investments}
      columns={columns}
      rowKey="id"
      loading={isFetching}
      locale={{ emptyText: "Sin inversiones registradas" }}
      pagination={false}
      scroll={{ x: true }}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/components/investments/InvestmentTable.test.tsx
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/investments/InvestmentTable.tsx tests/components/investments/InvestmentTable.test.tsx
git commit -m "feat: add InvestmentTable component"
```

---

## Task 9: InvestmentForm component + tests

**Files:**
- Create: `src/components/investments/InvestmentForm.tsx`
- Create: `tests/components/investments/InvestmentForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/investments/InvestmentForm.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { InvestmentType } from "../../../src/models/InvestmentType";
import type { Currency } from "../../../src/models/Currency";
import { InvestmentForm } from "../../../src/components/investments/InvestmentForm";

const mockTypes: InvestmentType[] = [
  { id: 1, description: "Acciones" },
  { id: 2, description: "FCI" },
];

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "USD", description: "Dólar" },
  { id: 2, symbol: "ARS", description: "Peso" },
];

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  isLoading: false,
  investmentTypes: mockTypes,
  currencies: mockCurrencies,
};

describe("InvestmentForm", () => {
  it("renders the form fields when open", () => {
    render(<InvestmentForm {...defaultProps} />);

    expect(screen.getByLabelText(/instrumento/i)).toBeInTheDocument();
    expect(screen.getByText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByText(/monto invertido/i)).toBeInTheDocument();
    expect(screen.getByText(/moneda/i)).toBeInTheDocument();
    expect(screen.getByText(/fecha de inversión/i)).toBeInTheDocument();
  });

  it("shows 'Nueva inversión' title in create mode", () => {
    render(<InvestmentForm {...defaultProps} />);

    expect(screen.getByText("Nueva inversión")).toBeInTheDocument();
  });

  it("shows 'Editar inversión' title when investment prop is provided", () => {
    const investment = {
      id: 1,
      instrumento: "AAPL",
      tipo: { id: 1, description: "Acciones" },
      montoInvertido: 1000,
      valorActual: 1200,
      fechaInversion: "2025-01-01",
      moneda: { id: 1, symbol: "USD", description: "Dólar" },
      account: { id: 10, name: "Familia" },
    };
    render(<InvestmentForm {...defaultProps} investment={investment} />);

    expect(screen.getByText("Editar inversión")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<InvestmentForm {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows type options in the select", async () => {
    const user = userEvent.setup();
    render(<InvestmentForm {...defaultProps} />);

    await user.click(screen.getByRole("combobox", { name: /tipo/i }));

    expect(await screen.findByText("Acciones")).toBeInTheDocument();
    expect(await screen.findByText("FCI")).toBeInTheDocument();
  });

  it("shows validation error when instrumento is empty and form is submitted", async () => {
    const user = userEvent.setup();
    render(<InvestmentForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /agregar/i }));

    expect(
      await screen.findByText("Ingresá el instrumento"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/components/investments/InvestmentForm.test.tsx
```

Expected: FAIL — `InvestmentForm` not found.

- [ ] **Step 3: Implement InvestmentForm**

```tsx
// src/components/investments/InvestmentForm.tsx
import { useEffect } from "react";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { InvestmentType } from "../../models/InvestmentType";
import type { Investment, CreateInvestmentForm } from "../../models/Investment";
import type { Currency } from "../../models/Currency";

interface InvestmentFormValues {
  instrumento: string;
  tipoId: number;
  montoInvertido: number;
  currency: string;
  fechaInversion: Dayjs;
}

interface InvestmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateInvestmentForm) => void;
  isLoading: boolean;
  investmentTypes: InvestmentType[];
  currencies: Currency[];
  investment?: Investment;
}

export function InvestmentForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  investmentTypes,
  currencies,
  investment,
}: InvestmentFormProps) {
  const [form] = Form.useForm<InvestmentFormValues>();
  const isEdit = investment != null;

  useEffect(() => {
    if (open && investment) {
      form.setFieldsValue({
        instrumento: investment.instrumento,
        tipoId: investment.tipo.id,
        montoInvertido: investment.montoInvertido,
        currency: investment.moneda.symbol,
        fechaInversion: dayjs(investment.fechaInversion),
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, investment, form]);

  const handleFinish = (values: InvestmentFormValues) => {
    onSubmit({
      ...values,
      fechaInversion: values.fechaInversion.toDate(),
    });
  };

  return (
    <Modal
      title={isEdit ? "Editar inversión" : "Nueva inversión"}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? "Guardar" : "Agregar"}
      cancelText="Cancelar"
      confirmLoading={isLoading}
      destroyOnHide
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="instrumento"
          label="Instrumento"
          rules={[{ required: true, message: "Ingresá el instrumento" }]}
        >
          <Input placeholder="Ej: AAPL, ES0113040035, BTC" />
        </Form.Item>

        <Form.Item
          name="tipoId"
          label="Tipo"
          rules={[{ required: true, message: "Seleccioná un tipo" }]}
        >
          <Select
            placeholder="Seleccioná un tipo"
            aria-label="tipo"
          >
            {investmentTypes.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="montoInvertido"
          label="Monto invertido"
          rules={[{ required: true, message: "Ingresá el monto" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="currency"
          label="Moneda"
          rules={[{ required: true, message: "Seleccioná la moneda" }]}
        >
          <Select placeholder="Seleccioná la moneda">
            {currencies.map((c) => (
              <Select.Option key={c.id} value={c.symbol}>
                {c.symbol}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="fechaInversion"
          label="Fecha de inversión"
          rules={[{ required: true, message: "Seleccioná la fecha" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/components/investments/InvestmentForm.test.tsx
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/investments/InvestmentForm.tsx tests/components/investments/InvestmentForm.test.tsx
git commit -m "feat: add InvestmentForm modal component"
```

---

## Task 10: Route + NavHeader

**Files:**
- Create: `src/routes/inversiones.tsx`
- Modify: `src/components/NavHeader.tsx`

- [ ] **Step 1: Create the route**

```tsx
// src/routes/inversiones.tsx
import { useState } from "react";
import { App, Button, Flex, Select, Typography } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import { useWorkspaces } from "../apis/hooks/useWorkspaces";
import { useInvestments, useCreateInvestment, useUpdateInvestment, useDeleteInvestment } from "../apis/hooks/useInvestments";
import { useInvestmentTypes } from "../apis/hooks/useInvestmentTypes";
import { useCurrency } from "../apis/hooks/useCurrency";
import { useInvestmentsSubscription } from "../apis/websocket/useInvestmentsSubscription";
import { InvestmentDashboard } from "../components/investments/InvestmentDashboard";
import { InvestmentTable } from "../components/investments/InvestmentTable";
import { InvestmentForm } from "../components/investments/InvestmentForm";
import type { Investment, CreateInvestmentForm } from "../models/Investment";

const { Title } = Typography;

export const Route = createFileRoute("/inversiones")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { message } = App.useApp();
  const { data: workspaces = [] } = useWorkspaces();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | undefined>(
    () => workspaces[0]?.workspaceId,
  );

  const accountId = selectedWorkspaceId ?? workspaces[0]?.workspaceId;

  const { data: investments = [], isFetching } = useInvestments(accountId);
  const { data: investmentTypes = [] } = useInvestmentTypes();
  const { data: currencies = [] } = useCurrency();

  useInvestmentsSubscription();

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();

  const createMutation = useCreateInvestment(accountId ?? 0, {
    onSuccess: () => {
      void message.success("Inversión agregada");
      setFormOpen(false);
    },
  });

  const updateMutation = useUpdateInvestment({
    onSuccess: () => {
      void message.success("Inversión actualizada");
      setFormOpen(false);
      setEditingInvestment(undefined);
    },
  });

  const deleteMutation = useDeleteInvestment({
    onSuccess: () => {
      void message.success("Inversión eliminada");
    },
  });

  const handleOpenCreate = () => {
    setEditingInvestment(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingInvestment(undefined);
  };

  const handleSubmit = (values: CreateInvestmentForm) => {
    if (editingInvestment) {
      updateMutation.mutate({ id: editingInvestment.id, form: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ paddingTop: 30 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Inversiones
        </Title>
        <Flex gap={8} align="center">
          {workspaces.length > 1 && (
            <Select
              value={accountId}
              onChange={setSelectedWorkspaceId}
              style={{ minWidth: 160 }}
              options={workspaces.map((w) => ({
                value: w.workspaceId,
                label: w.workspaceName,
              }))}
            />
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            disabled={accountId == null}
          >
            Agregar inversión
          </Button>
        </Flex>
      </Flex>

      <InvestmentDashboard investments={investments} isFetching={isFetching} />

      <InvestmentTable
        investments={investments}
        isFetching={isFetching}
        onEdit={handleOpenEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />

      <InvestmentForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        investmentTypes={investmentTypes}
        currencies={currencies}
        investment={editingInvestment}
      />
    </div>
  );
}
```

- [ ] **Step 2: Add "Inversiones" to NavHeader**

In `src/components/NavHeader.tsx`, add the import at the top:

```ts
import RiseOutlined from "@ant-design/icons/RiseOutlined";
```

Then in the `getNavItems` function, add the inversiones item after "budgets":

```ts
const getNavItems = (userType: UserTypeEnum | null): SideBarItem[] => {
  const labels = getServiceLabels(userType);

  return [
    {
      key: "servicios",
      icon: <BookOutlined />,
      label: labels.plural,
      path: "/services",
      roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
    },
    {
      key: "budgets",
      icon: <FundOutlined />,
      label: "Presupuestos",
      path: "/budgets",
      roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
    },
    {
      key: "inversiones",
      icon: <RiseOutlined />,
      label: "Inversiones",
      path: "/inversiones",
      roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
    },
    {
      key: "expenses",
      icon: <LineChartOutlined />,
      label: "Gastos",
      path: "/movement",
      roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
    },
  ];
};
```

- [ ] **Step 3: Run the dev server to regenerate routeTree.gen.ts**

```bash
pnpm dev
```

TanStack Router will auto-detect `src/routes/inversiones.tsx` and regenerate `routeTree.gen.ts`. Stop the server (Ctrl+C) once the file is regenerated (you'll see a log line about route generation).

- [ ] **Step 4: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
pnpm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/routes/inversiones.tsx src/components/NavHeader.tsx src/routeTree.gen.ts
git commit -m "feat: add inversiones route and nav item"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: all tests PASS, no regressions.

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run linter**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 4: Commit if there are any fixes**

If the above steps required small fixes, commit them:

```bash
git add -p
git commit -m "fix: lint and type fixes for inversiones feature"
```
