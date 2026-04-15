import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import AdminUserType from "../../../src/components/admin/AdminUserType";
import { UserTypeEnum } from "../../../src/enums/UserTypeEnum";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock del hook useCurrentUser
vi.mock("../../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: {
      id: 1,
      email: "admin@test.com",
      userType: UserTypeEnum.PERSONAL,
    },
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>{children}</ConfigProvider>
      </QueryClientProvider>
    );
  };
}

describe("AdminUserType", () => {
  it("should render current user type", () => {
    server.use(
      http.patch("http://localhost:8080/users/me/type", () => {
        return HttpResponse.text(null, { status: 204 });
      }),
    );

    render(<AdminUserType />, { wrapper: createWrapper() });

    expect(screen.getByText("Tipo de Usuario")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("should call mutation when user changes type", async () => {
    const user = userEvent.setup();
    let capturedRequest: { userType?: string } | null = null;

    server.use(
      http.patch("http://localhost:8080/users/me/type", async ({ request }) => {
        capturedRequest = (await request.json()) as { userType: string };
        return HttpResponse.text(null, { status: 204 });
      }),
    );

    render(<AdminUserType />, { wrapper: createWrapper() });

    // Buscar el botón de Enterprise y hacer click
    const enterpriseButton = screen.getByText("Enterprise");
    await user.click(enterpriseButton);

    await waitFor(() => {
      expect(capturedRequest).toEqual({ userType: "ENTERPRISE" });
    });
  });
});
