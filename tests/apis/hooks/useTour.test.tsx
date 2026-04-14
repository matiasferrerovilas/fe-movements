import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useMarkTourSeen } from "../../../src/apis/hooks/useTour";
import { CURRENT_USER_QUERY_KEY } from "../../../src/apis/hooks/useCurrentUser";
import type { CurrentUser } from "../../../src/models/CurrentUser";

const server = setupServer(
  http.put("http://localhost:8080/users/me/tour", () =>
    new HttpResponse(null, { status: 204 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockCurrentUser: CurrentUser = {
  id: 42,
  email: "test@example.com",
  isFirstLogin: false,
  userType: "ADMIN",
  hasSeenTour: false,
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // Pre-populate cache with currentUser
  queryClient.setQueryData(CURRENT_USER_QUERY_KEY, mockCurrentUser);

  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  };
}

describe("useMarkTourSeen", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("should call PUT /users/me/tour on mutate", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useMarkTourSeen(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should update currentUser cache with hasSeenTour: true on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const { result } = renderHook(() => useMarkTourSeen(), { wrapper });

    // Verify initial state
    const initialUser = queryClient.getQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY);
    expect(initialUser?.hasSeenTour).toBe(false);

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify cache was updated
    const updatedUser = queryClient.getQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY);
    expect(updatedUser?.hasSeenTour).toBe(true);
  });

  it("should not update cache if currentUser is not in cache", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    // Don't pre-populate cache

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMarkTourSeen(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Cache should still be undefined
    const user = queryClient.getQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY);
    expect(user).toBeUndefined();
  });

  it("should handle error when request fails", async () => {
    server.use(
      http.put("http://localhost:8080/users/me/tour", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useMarkTourSeen(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
