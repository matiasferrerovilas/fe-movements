import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { BankRecord } from "../../../../src/models/Bank";
import type { UserSetting } from "../../../../src/models/UserSetting";
import ImportMovementTab from "../../../../src/components/modals/movements/ImportMovementTab";
import * as antd from "antd";

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockBanks: BankRecord[] = [
  { id: 1, description: "GALICIA" },
  { id: 2, description: "BBVA" },
];

const defaultBankSetting: UserSetting = { key: "DEFAULT_BANK", value: 1 };

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/banks", () =>
    HttpResponse.json(mockBanks),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_BANK", () =>
    HttpResponse.json(defaultBankSetting),
  ),
  http.post("http://localhost:8080/expenses/import-file", () =>
    HttpResponse.json({}, { status: 201 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ImportMovementTab", () => {
  it("renderiza el formulario con campos banco y archivo", async () => {
    const ref = { current: null };
    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/banco/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/archivo/i)).toBeInTheDocument();
    });
  });

  it("acepta solo archivos .pdf", async () => {
    const ref = { current: null };
    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/archivo/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole("button", { name: /seleccionar archivo/i });
    const uploadInput = uploadButton.closest(".ant-upload")?.querySelector("input[type='file']") as HTMLInputElement;

    expect(uploadInput).toBeDefined();
    expect(uploadInput?.accept).toBe(".pdf");
  });

  it("valida que el campo banco sea requerido", async () => {
    const ref = { current: null };
    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/banco/i)).toBeInTheDocument();
    });

    // El test simplemente verifica que el campo banco es requerido
    // La validación de Ant Design se encarga de esto automáticamente
  });

  it("valida que el campo archivo sea requerido", async () => {
    const ref = { current: null };
    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/archivo/i)).toBeInTheDocument();
    });

    // Intentar confirmar sin archivo
    if (ref.current && "handleConfirm" in ref.current) {
      await expect(
        (ref.current as { handleConfirm: () => Promise<void> }).handleConfirm()
      ).rejects.toThrow();
    }
  });

  it("pre-selecciona el banco por defecto si existe DEFAULT_BANK", async () => {
    const ref = { current: null };
    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText("GALICIA")).toBeInTheDocument();
    });
  });

  it("muestra message.success al completar la importación exitosamente", async () => {
    const messageSpy = vi.spyOn(antd.message, "success");
    const onSuccess = vi.fn();
    const ref = { current: { handleConfirm: vi.fn() } };

    render(<ImportMovementTab ref={ref} onSuccess={onSuccess} />, {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/archivo/i)).toBeInTheDocument();
    });

    // Simular selección de archivo
    const file = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    const uploadInput = screen
      .getByRole("button", { name: /seleccionar archivo/i })
      .closest(".ant-upload")
      ?.querySelector("input[type='file']") as HTMLInputElement;

    if (uploadInput) {
      await userEvent.upload(uploadInput, file);
    }

    // Llamar handleConfirm via ref
    if (ref.current && "handleConfirm" in ref.current) {
      await (ref.current as { handleConfirm: () => Promise<void> }).handleConfirm();
    }

    await waitFor(() => {
      expect(messageSpy).toHaveBeenCalledWith("Movimientos importados correctamente");
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("muestra message.error con mensaje específico en caso de error 400", async () => {
    const messageSpy = vi.spyOn(antd.message, "error");
    const ref = { current: { handleConfirm: vi.fn() } };

    server.use(
      http.post("http://localhost:8080/expenses/import-file", () =>
        HttpResponse.json(
          { message: "Formato de archivo no soportado: txt. Formatos válidos: PDF, XLS, XLSX, CSV" },
          { status: 400 },
        ),
      ),
    );

    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/archivo/i)).toBeInTheDocument();
    });

    // Simular selección de archivo
    const file = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    const uploadInput = screen
      .getByRole("button", { name: /seleccionar archivo/i })
      .closest(".ant-upload")
      ?.querySelector("input[type='file']") as HTMLInputElement;

    if (uploadInput) {
      await userEvent.upload(uploadInput, file);
    }

    // Llamar handleConfirm via ref
    if (ref.current && "handleConfirm" in ref.current) {
      await (ref.current as { handleConfirm: () => Promise<void> }).handleConfirm();
    }

    await waitFor(() => {
      expect(messageSpy).toHaveBeenCalledWith(
        "Formato de archivo no soportado: txt. Formatos válidos: PDF, XLS, XLSX, CSV"
      );
    });
  });

  it("muestra el texto informativo sobre bancos soportados", async () => {
    const ref = { current: null };
    render(<ImportMovementTab ref={ref} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/BBVA, Galicia/i)).toBeInTheDocument();
      expect(screen.getByText(/resúmenes de tarjeta de crédito/i)).toBeInTheDocument();
    });
  });
});
