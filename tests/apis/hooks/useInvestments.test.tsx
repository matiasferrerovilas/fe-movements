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
    description: `TICKER${id}`,
    investmentType: { id: 1, name: "Acciones", workspaceId: 1 },
    amount: 1000,
    startDate: "2025-01-01",
    endDate: null,
    currency: { id: 1, symbol: "USD", description: "Dólar" },
    workspaceName: "Familia",
    owner: "Test User",
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
        description: "AAPL",
        investmentTypeId: 1,
        amount: 500,
        currencySymbol: "USD",
        startDate: new Date("2025-06-01"),
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedBody).toMatchObject({
      description: "AAPL",
      investmentTypeId: 1,
      amount: 500,
      currencySymbol: "USD",
      startDate: "2025-06-01",
      accountId: 10,
    });
  });

  it("invalidates investments query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateInvestment(10), { wrapper });

    await act(async () => {
      result.current.mutate({
        description: "AAPL",
        investmentTypeId: 1,
        amount: 500,
        currencySymbol: "USD",
        startDate: new Date("2025-06-01"),
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
      result.current.mutate({ id: 1, form: { description: "MSFT", amount: 800 } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedId).toBe("1");
    expect(capturedBody).toMatchObject({ description: "MSFT", amount: 800 });
  });

  it("invalidates investments query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateInvestment(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, form: { description: "MSFT" } });
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
