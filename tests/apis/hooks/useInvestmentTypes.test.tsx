import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { InvestmentType } from "@/models/InvestmentType";
import { useInvestmentTypes } from "@/apis/hooks/useInvestmentTypes";

const mockTypes: InvestmentType[] = [
  { id: 1, name: "Acciones", iconName: "RiseOutlined", iconColor: "#52c41a", workspaceId: 1 },
  { id: 2, name: "FCI", iconName: "FundOutlined", iconColor: "#1677ff", workspaceId: 1 },
  { id: 3, name: "Crypto", iconName: "CryptoOutlined", iconColor: "#faad14", workspaceId: 1 },
];

const server = setupServer(
  http.get("http://localhost:8080/workspace/investment-types", () =>
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
  it("calls GET /workspace/investment-types and returns the list", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].name).toBe("Acciones");
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/investment-types", () =>
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
      http.get("http://localhost:8080/workspace/investment-types", () =>
        HttpResponse.json([]),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("data is not stale immediately after fetch", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useInvestmentTypes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });
});
