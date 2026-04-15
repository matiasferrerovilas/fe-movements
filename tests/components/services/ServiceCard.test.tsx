import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Service, ServiceToUpdate } from "../../../src/models/Service";
import { ServiceCard } from "../../../src/components/services/ServiceCard";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../../src/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("../../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "CONSUMER" },
    isLoading: false,
  }),
}));

import { useWorkspaces } from "../../../src/apis/hooks/useWorkspaces";

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.delete("http://localhost:8080/subscriptions/:id", () =>
    HttpResponse.json({}, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Fixtures ───────────────────────────────────────────────────────────────

function makeService(overrides?: Partial<Service>): Service {
  return {
    id: 1,
    amount: 1500,
    description: "Netflix",
    workspaceName: "Familia",
    workspaceId: 10,
    date: "2026-01-01",
    user: "me@test.com",
    currency: { id: 1, symbol: "ARS", description: "Peso argentino" },
    lastPayment: null,
    isPaid: false,
    ...overrides,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Ant Design icon-only buttons get their accessible name from the icon's aria-label.
// The Tooltip title is not reflected in the button role — use the icon aria-label instead.
const editBtn = () => screen.getByRole("button", { name: "edit" });
const saveBtn = () => screen.getByRole("button", { name: /guardar/i });
const cancelBtn = () => screen.getByRole("button", { name: /cancelar/i });
const payBtn = () => screen.getByRole("button", { name: /marcar como pagado/i });
const queryPayBtn = () => screen.queryByRole("button", { name: /marcar como pagado/i });
const querySaveBtn = () => screen.queryByRole("button", { name: /guardar/i });

describe("ServiceCard", () => {
  let queryClient: QueryClient;
  let handlePay: ReturnType<typeof vi.fn>;
  let handleUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    handlePay = vi.fn();
    handleUpdate = vi.fn();

    vi.mocked(useWorkspaces).mockReturnValue({
      data: [
        { workspaceId: 10, membershipId: 1, workspaceName: "Familia", role: "ADMIN" },
        { workspaceId: 20, membershipId: 2, workspaceName: "Trabajo", role: "FAMILY" },
      ],
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Servicio pendiente (isPaid: false) ────────────────────────────────────

  describe("servicio pendiente (isPaid: false)", () => {
    it("muestra el botón de editar", () => {
      render(
        <ServiceCard
          service={makeService()}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      expect(editBtn()).toBeInTheDocument();
    });

    it("muestra el botón 'Marcar como pagado'", () => {
      render(
        <ServiceCard
          service={makeService()}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      expect(screen.getByRole("button", { name: /marcar como pagado/i })).toBeInTheDocument();
    });

    it("entra en modo edición al hacer click en Editar", async () => {
      render(
        <ServiceCard
          service={makeService()}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());

      expect(saveBtn()).toBeInTheDocument();
      expect(cancelBtn()).toBeInTheDocument();
    });

    it("no muestra 'Marcar como pagado' en modo edición", async () => {
      render(
        <ServiceCard
          service={makeService()}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());

      expect(queryPayBtn()).not.toBeInTheDocument();
    });

    it("cancela la edición y vuelve al estado original", async () => {
      render(
        <ServiceCard
          service={makeService()}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());
      await userEvent.click(cancelBtn());

      expect(payBtn()).toBeInTheDocument();
      expect(querySaveBtn()).not.toBeInTheDocument();
    });
  });

  // ── Servicio pagado (isPaid: true) ────────────────────────────────────────

  describe("servicio pagado (isPaid: true)", () => {
    it("muestra el botón de editar aunque el servicio esté pagado", () => {
      render(
        <ServiceCard
          service={makeService({ isPaid: true })}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      expect(editBtn()).toBeInTheDocument();
    });

    it("NO muestra el botón 'Marcar como pagado' cuando ya está pagado", () => {
      render(
        <ServiceCard
          service={makeService({ isPaid: true })}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      expect(screen.queryByRole("button", { name: /marcar como pagado/i })).not.toBeInTheDocument();
    });

    it("entra en modo edición al hacer click en Editar con servicio pagado", async () => {
      render(
        <ServiceCard
          service={makeService({ isPaid: true })}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());

      expect(saveBtn()).toBeInTheDocument();
      expect(cancelBtn()).toBeInTheDocument();
    });

    it("NO muestra 'Marcar como pagado' en modo edición con servicio pagado", async () => {
      render(
        <ServiceCard
          service={makeService({ isPaid: true })}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());

      expect(queryPayBtn()).not.toBeInTheDocument();
    });

    it("llama a handleUpdateServiceMutation con los parámetros correctos al guardar", async () => {
      const service = makeService({ isPaid: true, amount: 1500, description: "Netflix" });

      render(
        <ServiceCard
          service={service}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());

      // Cambiar el monto
      const amountInput = screen.getByRole("spinbutton");
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, "2000");

      await userEvent.click(saveBtn());

      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining<Partial<ServiceToUpdate>>({
          id: service.id,
          changes: expect.objectContaining({ amount: 2000 }),
        }),
      );
    });

    it("no envía workspace al guardar la edición (el backend usa el workspace activo)", async () => {
      const service = makeService({ isPaid: true, workspaceName: "Familia", workspaceId: 10 });

      render(
        <ServiceCard
          service={service}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());
      await userEvent.click(saveBtn());

      // Verificar que se llamó con los cambios esperados (sin workspace)
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining<Partial<ServiceToUpdate>>({
          id: service.id,
          changes: expect.not.objectContaining({ workspace: expect.anything() }),
        }),
      );
    });

    it("cancela la edición de un servicio pagado y vuelve a la vista normal", async () => {
      render(
        <ServiceCard
          service={makeService({ isPaid: true })}
          handlePayServiceMutation={handlePay}
          handleUpdateServiceMutation={handleUpdate}
        />,
        { wrapper: makeWrapper(queryClient) },
      );

      await userEvent.click(editBtn());
      await userEvent.click(cancelBtn());

      // Volvió al estado normal, el botón de editar debe estar de nuevo visible
      expect(editBtn()).toBeInTheDocument();
      expect(querySaveBtn()).not.toBeInTheDocument();
    });
  });
});
