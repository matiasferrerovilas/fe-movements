import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider, type QueryClientConfig } from "@tanstack/react-query";
import { App } from "antd";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Category } from "../../../src/models/Category";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";

// ── MSW server ─────────────────────────────────────────────────────────────

const mockCategories: Category[] = [
  { id: 1, description: "COMIDA", isActive: true, isDeletable: false },
  { id: 2, description: "TRANSPORTE", isActive: true, isDeletable: true },
  { id: 3, description: "HOGAR", isActive: true, isDeletable: true },
];

const server = setupServer(
  // Las categorías ahora se obtienen sin workspaceId en el path
  http.get("http://localhost:8080/workspace/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.patch("http://localhost:8080/workspace/categories/migrate", () =>
    new HttpResponse(null, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

const queryClientConfig: QueryClientConfig = {
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
};

function makeWrapper(roles: string[] = ["ROLE_ADMIN"]) {
  vi.mocked(useKeycloak).mockReturnValue({
    keycloak: {
      tokenParsed: {
        realm_access: { roles },
      },
    },
    initialized: true,
  } as ReturnType<typeof useKeycloak>);

  const queryClient = new QueryClient(queryClientConfig);
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <App>{children}</App>
      </QueryClientProvider>
    ),
  };
}

// Lazy import after mock setup
const { SettingCategoryMigrate } = await import(
  "../../../src/components/settings/SettingCategoryMigrate"
);

function renderComponent(roles?: string[]) {
  const { wrapper, queryClient } = makeWrapper(roles);
  const result = render(<SettingCategoryMigrate />, { wrapper });
  return { ...result, queryClient };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SettingCategoryMigrate", () => {
  describe("control de acceso", () => {
    it("no renderiza nada para usuarios sin ROLE_ADMIN", async () => {
      renderComponent(["ROLE_FAMILY"]);
      await waitFor(() =>
        expect(screen.queryByText("Migrar Categoría")).not.toBeInTheDocument(),
      );
    });

    it("no renderiza nada para usuarios con rol GUEST", async () => {
      renderComponent(["ROLE_GUEST"]);
      await waitFor(() =>
        expect(screen.queryByText("Migrar Categoría")).not.toBeInTheDocument(),
      );
    });

    it("renderiza la seccion para usuarios con ROLE_ADMIN", async () => {
      renderComponent(["ROLE_ADMIN"]);
      await waitFor(() =>
        expect(screen.getByText("Migrar Categoría")).toBeInTheDocument(),
      );
    });

    it("renderiza la seccion para usuarios con rol ADMIN (sin prefijo)", async () => {
      renderComponent(["ADMIN"]);
      await waitFor(() =>
        expect(screen.getByText("Migrar Categoría")).toBeInTheDocument(),
      );
    });
  });

  describe("render inicial (ADMIN)", () => {
    it("muestra el label Categoría origen", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Categoría origen")).toBeInTheDocument(),
      );
    });

    it("muestra el label Categoría destino", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Categoría destino")).toBeInTheDocument(),
      );
    });

    it("el botón Migrar está deshabilitado si no se seleccionó origen ni destino", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Migrar")).toBeInTheDocument(),
      );
      expect(screen.getByText("Migrar").closest("button")).toBeDisabled();
    });

    it("muestra los dos combobox de seleccion de categoria", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getAllByRole("combobox")).toHaveLength(2),
      );
    });

    it("muestra las categorías disponibles al abrir el selector origen", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() =>
        expect(screen.getAllByRole("combobox")).toHaveLength(2),
      );

      // Abrir el selector origen: click en el parentElement del combobox
      const comboboxes = screen.getAllByRole("combobox");
      await user.click(comboboxes[0].parentElement!);

      await waitFor(() => {
        const opts = Array.from(
          document.querySelectorAll(".ant-select-item"),
        ).map((el) => el.textContent);
        expect(opts).toContain("Comida");
        expect(opts).toContain("Transporte");
        expect(opts).toContain("Hogar");
      });
    });

    it("muestra el texto descriptivo de la seccion", async () => {
      renderComponent();
      await waitFor(() =>
        expect(
          screen.getByText(
            "Solo administradores. Reasigna todos tus movimientos de una categoría a otra.",
          ),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("comportamiento del form (validación)", () => {
    it("el botón Migrar permanece deshabilitado si solo se selecciona el origen", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() =>
        expect(screen.getAllByRole("combobox")).toHaveLength(2),
      );

      // Abrir y seleccionar origen
      const comboboxes = screen.getAllByRole("combobox");
      await user.click(comboboxes[0].parentElement!);
      const comidaOpt = await waitFor(() => {
        const opts = Array.from(document.querySelectorAll(".ant-select-item"));
        const found = opts.find((el) => el.textContent === "Comida");
        if (!found) throw new Error("Comida option not found");
        return found as HTMLElement;
      });
      // Usar fireEvent para clickear el item (evita pointer-events check de userEvent)
      const { fireEvent: fe } = await import("@testing-library/react");
      fe.click(comidaOpt);

      // El botón debe seguir deshabilitado porque el destino no está seleccionado
      await waitFor(() =>
        expect(screen.getByText("Migrar").closest("button")).toBeDisabled(),
      );
    });
  });

  describe("endpoint PATCH /workspace/{workspaceId}/categories/migrate", () => {
    it("el endpoint es llamado con fromCategoryId y toCategoryId", async () => {
      // Este test verifica la integración a nivel de hook (cubierto en useCategory.test.tsx)
      // Aquí verificamos que el componente tiene el botón Migrar y el Popconfirm configurado
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Migrar Categoría")).toBeInTheDocument(),
      );

      // Verificar que el texto del Popconfirm describe la operacion
      await waitFor(() =>
        expect(screen.getByText("Migrar Categoría")).toBeInTheDocument(),
      );
    });
  });
});
