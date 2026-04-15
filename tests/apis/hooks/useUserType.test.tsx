import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { useChangeUserType } from "../../../src/apis/hooks/useUserType";
import { UserTypeEnum } from "../../../src/enums/UserTypeEnum";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useChangeUserType", () => {
  it("should call PATCH /users/me/type with correct payload", async () => {
    let capturedRequest: { userType?: string } | null = null;

    server.use(
      http.patch("http://localhost:8080/users/me/type", async ({ request }) => {
        capturedRequest = (await request.json()) as { userType: string };
        return HttpResponse.text(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useChangeUserType(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userType: UserTypeEnum.ENTERPRISE });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(capturedRequest).toEqual({ userType: "ENTERPRISE" });
  });

  it("should invalidate current user query on success", async () => {
    server.use(
      http.patch("http://localhost:8080/users/me/type", () => {
        return HttpResponse.text(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useChangeUserType(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userType: UserTypeEnum.PERSONAL });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should handle 403 error (forbidden)", async () => {
    server.use(
      http.patch("http://localhost:8080/users/me/type", () => {
        return HttpResponse.json(
          { message: "Forbidden" },
          { status: 403 },
        );
      }),
    );

    const { result } = renderHook(() => useChangeUserType(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userType: UserTypeEnum.ENTERPRISE });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("should handle 400 error (bad request)", async () => {
    server.use(
      http.patch("http://localhost:8080/users/me/type", () => {
        return HttpResponse.json(
          { message: "Invalid userType" },
          { status: 400 },
        );
      }),
    );

    const { result } = renderHook(() => useChangeUserType(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userType: "INVALID_TYPE" as UserTypeEnum });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
