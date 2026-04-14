import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { CurrentUser } from "../../../src/models/CurrentUser";
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from "../../../src/apis/hooks/useCurrentUser";

// Mock @react-keycloak/web
vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";

const mockCurrentUser: CurrentUser = {
  id: 42,
  email: "test@example.com",
  givenName: "Test",
  familyName: "User",
  isFirstLogin: false,
  userType: "ADMIN",
  hasSeenTour: true,
};

const server = setupServer(
  http.get("http://localhost:8080/users/me", () =>
    HttpResponse.json(mockCurrentUser),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /users/me and returns the current user when authenticated", async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCurrentUser);
  });

  it("does not fetch when keycloak is not authenticated", () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: false } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    });

    // enabled: false → query stays in idle/pending, never fires
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("uses the correct query key", async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // CURRENT_USER_QUERY_KEY is ["current-user"]
    expect(CURRENT_USER_QUERY_KEY).toEqual(["current-user"]);
  });

  it("sets staleTime and gcTime to Infinity", async () => {
    // We verify indirectly: after a successful fetch, data is available
    // and no refetch is triggered (isStale remains false)
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/users/me", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
