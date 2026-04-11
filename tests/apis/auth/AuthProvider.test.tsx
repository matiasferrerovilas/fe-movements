import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { AuthProvider } from "../../../src/apis/auth/AuthProvider";
import { AuthContext } from "../../../src/apis/auth/AuthContext";

// Mock @react-keycloak/web
vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";

afterEach(() => {
  vi.clearAllMocks();
});

// Consumer component to read context values
function AuthConsumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="authenticated">{String(ctx.authenticated)}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  it("sets loading=false, authenticated=false when Keycloak is not authenticated", async () => {
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
  });

  it("sets loading=false, authenticated=true when Keycloak is authenticated", async () => {
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
  });

  it("does not call /users/me", async () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );

    const usersMe = fetchSpy.mock.calls.find(([url]) =>
      String(url).includes("/users/me"),
    );
    expect(usersMe).toBeUndefined();
  });
});
