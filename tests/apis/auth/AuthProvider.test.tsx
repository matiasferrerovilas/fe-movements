import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthProvider } from "../../../src/apis/auth/AuthProvider";
import { AuthContext } from "../../../src/apis/auth/AuthContext";
import type { CurrentUser } from "../../../src/models/CurrentUser";

// Mock @react-keycloak/web
vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";

const mockCurrentUser: CurrentUser = {
  id: 10,
  email: "user@test.com",
  isFirstLogin: false,
  userType: "FAMILY",
};

const mockFirstLoginUser: CurrentUser = {
  id: null,
  email: null,
  isFirstLogin: true,
  userType: null,
};

const server = setupServer(
  http.get("http://localhost:8080/users/me", () =>
    HttpResponse.json(mockCurrentUser),
  ),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// Consumer component to read context values
function AuthConsumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="authenticated">{String(ctx.authenticated)}</span>
      <span data-testid="firstLogin">{String(ctx.firstLogin)}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <button onClick={ctx.completeOnboarding}>completeOnboarding</button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("sets loading=false, authenticated=false when not authenticated", async () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: false } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("firstLogin").textContent).toBe("false");
  });

  it("fetches /users/me and sets authenticated=true, firstLogin=false on success", async () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("firstLogin").textContent).toBe("false");
  });

  it("sets firstLogin=true when isFirstLogin is true in /users/me response", async () => {
    server.use(
      http.get("http://localhost:8080/users/me", () =>
        HttpResponse.json(mockFirstLoginUser),
      ),
    );

    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("firstLogin").textContent).toBe("true");
    expect(screen.getByTestId("authenticated").textContent).toBe("true");
  });

  it("sets authenticated=true, firstLogin=false when /users/me fails", async () => {
    server.use(
      http.get("http://localhost:8080/users/me", () =>
        HttpResponse.json({ message: "error" }, { status: 500 }),
      ),
    );

    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("firstLogin").textContent).toBe("false");
  });

  it("completeOnboarding sets firstLogin to false", async () => {
    server.use(
      http.get("http://localhost:8080/users/me", () =>
        HttpResponse.json(mockFirstLoginUser),
      ),
    );

    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("firstLogin").textContent).toBe("true"),
    );

    await userEvent.click(screen.getByRole("button", { name: "completeOnboarding" }));

    expect(screen.getByTestId("firstLogin").textContent).toBe("false");
  });
});
