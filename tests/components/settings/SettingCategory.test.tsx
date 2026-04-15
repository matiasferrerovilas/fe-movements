import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Category } from "../../../src/models/Category";
import { SettingCategory } from "../../../src/components/settings/SettingCategory";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: { tokenParsed: { realm_access: { roles: [] } } },
    initialized: true,
  })),
}));

vi.mock("../../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

// ── MSW server ─────────────────────────────────────────────────────────────

const mockCategories: Category[] = [
  { id: 1, description: "SERVICIOS", isActive: true, isDeletable: false },
  { id: 2, description: "HOGAR", isActive: true, isDeletable: true },
];

const newCategory: Category = {
  id: 7,
  description: "VIAJES",
  isActive: true,
  isDeletable: true,
};

const server = setupServer(
  // Las categorías ahora se obtienen sin workspaceId en el path
  http.get("http://localhost:8080/workspace/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.post("http://localhost:8080/workspace/categories", () =>
    HttpResponse.json(newCategory, { status: 201 }),
  ),
  http.delete("http://localhost:8080/workspace/categories/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

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

function renderSettingCategory() {
  const { wrapper, queryClient } = makeWrapper();
  const result = render(<SettingCategory />, { wrapper });
  return { ...result, queryClient };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SettingCategory", () => {
  describe("render inicial", () => {
    it("muestra el título Mis Categorías", async () => {
      renderSettingCategory();
      await waitFor(() =>
        expect(screen.getByText("Mis Categorías")).toBeInTheDocument(),
      );
    });

    it("muestra las categorías del usuario capitalizadas", async () => {
      renderSettingCategory();
      await waitFor(() => {
        expect(screen.getByText("Servicios")).toBeInTheDocument();
        expect(screen.getByText("Hogar")).toBeInTheDocument();
      });
    });

    it("muestra el formulario para agregar categoría", async () => {
      renderSettingCategory();
      await waitFor(() =>
        expect(
          screen.getByPlaceholderText("Nombre de la categoría..."),
        ).toBeInTheDocument(),
      );
      expect(screen.getByText("Agregar")).toBeInTheDocument();
    });

    it("muestra solo el formulario cuando no hay categorías", async () => {
      server.use(
        http.get("http://localhost:8080/workspace/categories", () =>
          HttpResponse.json([]),
        ),
      );
      renderSettingCategory();
      await waitFor(() =>
        expect(
          screen.getByPlaceholderText("Nombre de la categoría..."),
        ).toBeInTheDocument(),
      );
      expect(screen.queryByText("Servicios")).not.toBeInTheDocument();
    });
  });

  describe("formulario de creación", () => {
    it("llama POST /workspace/categories con la descripción como query param al hacer submit", async () => {
      const user = userEvent.setup();
      let capturedUrl: string | undefined;
      server.use(
        http.post("http://localhost:8080/workspace/categories", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(newCategory, { status: 201 });
        }),
      );

      renderSettingCategory();
      await waitFor(() =>
        expect(
          screen.getByPlaceholderText("Nombre de la categoría..."),
        ).toBeInTheDocument(),
      );

      await user.type(
        screen.getByPlaceholderText("Nombre de la categoría..."),
        "viajes",
      );
      await user.click(screen.getByText("Agregar"));

      await waitFor(() => {
        expect(capturedUrl).toContain("description=viajes");
      });
    });

    it("muestra error de validación si se envía el form vacío", async () => {
      const user = userEvent.setup();
      renderSettingCategory();

      await waitFor(() =>
        expect(screen.getByText("Agregar")).toBeInTheDocument(),
      );

      await user.click(screen.getByText("Agregar"));

      await waitFor(() =>
        expect(
          screen.getByText("Ingresá el nombre de la categoría"),
        ).toBeInTheDocument(),
      );
    });

    it("limpia el input tras agregar con éxito", async () => {
      const user = userEvent.setup();
      renderSettingCategory();

      await waitFor(() =>
        expect(
          screen.getByPlaceholderText("Nombre de la categoría..."),
        ).toBeInTheDocument(),
      );

      await user.type(
        screen.getByPlaceholderText("Nombre de la categoría..."),
        "viajes",
      );
      await user.click(screen.getByText("Agregar"));

      await waitFor(() =>
        expect(
          screen.getByPlaceholderText("Nombre de la categoría..."),
        ).toHaveValue(""),
      );
    });
  });

  describe("botón de delete", () => {
    it("el botón de eliminar está deshabilitado para categorías con isDeletable: false", async () => {
      renderSettingCategory();
      await waitFor(() =>
        expect(screen.getByText("Servicios")).toBeInTheDocument(),
      );

      const deleteServiciosBtn = screen.getByRole("button", {
        name: /Eliminar categoría SERVICIOS/i,
      });
      const deleteHogarBtn = screen.getByRole("button", {
        name: /Eliminar categoría HOGAR/i,
      });
      expect(deleteServiciosBtn).toBeDisabled(); // SERVICIOS — isDeletable: false
      expect(deleteHogarBtn).not.toBeDisabled(); // HOGAR — isDeletable: true
    });

    it("el botón de eliminar está habilitado para categorías con isDeletable: true", async () => {
      renderSettingCategory();
      await waitFor(() =>
        expect(screen.getByText("Hogar")).toBeInTheDocument(),
      );

      const deleteHogarBtn = screen.getByRole("button", {
        name: /Eliminar categoría HOGAR/i,
      });
      expect(deleteHogarBtn).not.toBeDisabled();
    });

    it("llama DELETE /workspace/categories/{id} al confirmar el popconfirm", async () => {
      const user = userEvent.setup();
      let deletedId: string | undefined;
      server.use(
        http.delete(
          "http://localhost:8080/workspace/categories/:id",
          ({ params }) => {
            deletedId = params.id as string;
            return new HttpResponse(null, { status: 204 });
          },
        ),
      );

      renderSettingCategory();
      await waitFor(() =>
        expect(screen.getByText("Hogar")).toBeInTheDocument(),
      );

      // Click el botón delete de HOGAR (isDeletable: true, no está disabled)
      const deleteHogarBtn = screen.getByRole("button", {
        name: /Eliminar categoría HOGAR/i,
      });
      await user.click(deleteHogarBtn);

      // Confirmar en el Popconfirm
      const confirmBtn = await screen.findByText("Eliminar");
      await user.click(confirmBtn);

      await waitFor(() => expect(deletedId).toBe("2"));
    });
  });
});
