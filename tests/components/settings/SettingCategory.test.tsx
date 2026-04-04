import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Category } from "../../../src/models/Category";
import { SettingCategory } from "../../../src/components/settings/SettingCategory";

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
  http.get("http://localhost:8080/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.post("http://localhost:8080/categories", () =>
    HttpResponse.json(newCategory, { status: 201 }),
  ),
  http.delete("http://localhost:8080/categories/:id", () =>
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
        http.get("http://localhost:8080/categories", () =>
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
    it("llama POST /categories con la descripción como query param al hacer submit", async () => {
      const user = userEvent.setup();
      let capturedUrl: string | undefined;
      server.use(
        http.post("http://localhost:8080/categories", ({ request }) => {
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

      const allDeleteBtns = document.querySelectorAll(".category-delete-btn");
      expect(allDeleteBtns[0]).toBeDisabled(); // SERVICIOS — isDeletable: false
      expect(allDeleteBtns[1]).not.toBeDisabled(); // HOGAR — isDeletable: true
    });

    it("el botón de eliminar está habilitado para categorías con isDeletable: true", async () => {
      renderSettingCategory();
      await waitFor(() =>
        expect(screen.getByText("Hogar")).toBeInTheDocument(),
      );

      const allDeleteBtns = document.querySelectorAll(".category-delete-btn");
      expect(allDeleteBtns[1]).not.toBeDisabled();
    });

    it("llama DELETE /categories/{id} al confirmar el popconfirm", async () => {
      const user = userEvent.setup();
      let deletedId: string | undefined;
      server.use(
        http.delete(
          "http://localhost:8080/categories/:id",
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
      const allDeleteBtns = document.querySelectorAll(".category-delete-btn");
      await user.click(allDeleteBtns[1] as HTMLElement);

      // Confirmar en el Popconfirm
      const confirmBtn = await screen.findByText("Eliminar");
      await user.click(confirmBtn);

      await waitFor(() => expect(deletedId).toBe("2"));
    });
  });
});
