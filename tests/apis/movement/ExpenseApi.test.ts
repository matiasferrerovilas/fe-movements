import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import dayjs from "dayjs";
import {
  uploadExpense,
  updateExpense,
  uploadExpenseApi,
} from "../../../src/apis/movement/ExpenseApi";
import type { CreateMovementForm } from "../../../src/models/Movement";
import type { UploadPayload } from "../../../src/components/modals/movements/ImportMovementTab";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Construye un CreateMovementForm con la fecha indicada.
 * `date` debe ser un objeto Date con la fecha local deseada.
 */
function makeForm(date: Date): CreateMovementForm {
  return {
    bank: "GALICIA",
    description: "Test movimiento",
    date,
    currency: "ARS",
    amount: 1000,
    type: "DEBITO",
    category: "Supermercado",
  };
}

// ── Captura del payload enviado al backend ───────────────────────────────────

let capturedCreateBody: Record<string, unknown> = {};
let capturedUpdateBody: Record<string, unknown> = {};

const server = setupServer(
  http.post("http://localhost:8080/expenses", async ({ request }) => {
    capturedCreateBody = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 1 }, { status: 201 });
  }),
  http.patch("http://localhost:8080/expenses/:id", async ({ request }) => {
    capturedUpdateBody = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 1 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  capturedCreateBody = {};
  capturedUpdateBody = {};
});
afterAll(() => server.close());

// ── Tests ────────────────────────────────────────────────────────────────────

describe("ExpenseApi — serialización de fechas", () => {
  describe("uploadExpense (crear movimiento)", () => {
    it("envía la fecha en formato YYYY-MM-DD usando la hora local del dispositivo", async () => {
      // Fecha local: 31 de marzo de 2026 a las 23:50 (caso crítico para UTC-X)
      const localDate = new Date(2026, 2, 31, 23, 50, 0); // mes 2 = marzo (0-indexed)
      const form = makeForm(localDate);

      await uploadExpense(form);

      expect(capturedCreateBody.date).toBe("2026-03-31");
    });

    it("no envía timestamp ni tiempo en la fecha", async () => {
      const localDate = new Date(2026, 5, 15, 14, 0, 0); // 15 jun 2026 14:00
      const form = makeForm(localDate);

      await uploadExpense(form);

      // La fecha enviada debe ser solo YYYY-MM-DD, sin T ni Z
      expect(typeof capturedCreateBody.date).toBe("string");
      expect(capturedCreateBody.date as string).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("coincide con dayjs(date).format('YYYY-MM-DD') — la fecha del calendario local", async () => {
      const localDate = new Date(2026, 0, 1, 0, 30, 0); // 1 ene 2026 a las 00:30 local
      const expectedDate = dayjs(localDate).format("YYYY-MM-DD");
      const form = makeForm(localDate);

      await uploadExpense(form);

      expect(capturedCreateBody.date).toBe(expectedDate);
    });
  });

  describe("updateExpense (actualizar movimiento)", () => {
    it("envía la fecha en formato YYYY-MM-DD usando la hora local del dispositivo", async () => {
      const localDate = new Date(2026, 2, 31, 23, 50, 0); // 31 mar 2026 23:50 local
      const form = makeForm(localDate);

      await updateExpense(99, form);

      expect(capturedUpdateBody.date).toBe("2026-03-31");
    });

    it("no envía timestamp ni tiempo en la fecha", async () => {
      const localDate = new Date(2026, 11, 25, 9, 0, 0); // 25 dic 2026
      const form = makeForm(localDate);

      await updateExpense(99, form);

      expect(typeof capturedUpdateBody.date).toBe("string");
      expect(capturedUpdateBody.date as string).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("coincide con dayjs(date).format('YYYY-MM-DD') — la fecha del calendario local", async () => {
      const localDate = new Date(2026, 0, 1, 0, 30, 0); // 1 ene 2026 a las 00:30 local
      const expectedDate = dayjs(localDate).format("YYYY-MM-DD");
      const form = makeForm(localDate);

      await updateExpense(99, form);

      expect(capturedUpdateBody.date).toBe(expectedDate);
    });
  });

  describe("uploadExpenseApi (importar archivo)", () => {
    it("envía FormData con file y bank correctamente", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const payload: UploadPayload = {
        file: mockFile,
        bank: "SANTANDER",
      };

      let requestReceived = false;
      let receivedBank = "";

      server.use(
        http.post("http://localhost:8080/expenses/import-file", async ({ request }) => {
          const formData = await request.formData();
          const file = formData.get("file");
          const bank = formData.get("bank");

          requestReceived = true;
          receivedBank = bank as string;

          // Verificar que file y bank están presentes
          expect(file).not.toBeNull();
          expect(bank).toBe("SANTANDER");

          return HttpResponse.json({}, { status: 201 });
        }),
      );

      await uploadExpenseApi(payload);

      // Verificar que la request fue interceptada y procesada
      expect(requestReceived).toBe(true);
      expect(receivedBank).toBe("SANTANDER");
    });

    it("lanza error con mensaje específico cuando el backend retorna 400", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });

      const payload: UploadPayload = {
        file: mockFile,
        bank: "BBVA",
      };

      server.use(
        http.post("http://localhost:8080/expenses/import-file", () => {
          return HttpResponse.json(
            { message: "Formato de archivo no soportado: txt. Formatos válidos: PDF, XLS, XLSX, CSV" },
            { status: 400 },
          );
        }),
      );

      await expect(uploadExpenseApi(payload)).rejects.toThrow(
        "Formato de archivo no soportado: txt. Formatos válidos: PDF, XLS, XLSX, CSV",
      );
    });

    it("lanza error genérico cuando el backend retorna 400 sin mensaje", async () => {
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      const payload: UploadPayload = {
        file: mockFile,
        bank: "INVALID_BANK",
      };

      server.use(
        http.post("http://localhost:8080/expenses/import-file", () => {
          return HttpResponse.json({}, { status: 400 });
        }),
      );

      await expect(uploadExpenseApi(payload)).rejects.toThrow(
        "Error al importar archivo",
      );
    });

    it("lanza error cuando falta el archivo", async () => {
      const payload: UploadPayload = {
        file: null,
        bank: "SANTANDER",
      };

      await expect(uploadExpenseApi(payload)).rejects.toThrow(
        "Missing required fields: file or bank",
      );
    });

    it("lanza error cuando falta el banco", async () => {
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      const payload: UploadPayload = {
        file: mockFile,
        bank: null,
      };

      await expect(uploadExpenseApi(payload)).rejects.toThrow(
        "Missing required fields: file or bank",
      );
    });

    it("retorna respuesta exitosa cuando el backend responde 201", async () => {
      const mockFile = new File(["test"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const payload: UploadPayload = {
        file: mockFile,
        bank: "SANTANDER",
      };

      server.use(
        http.post("http://localhost:8080/expenses/import-file", () => {
          return HttpResponse.json({}, { status: 201 });
        }),
      );

      await expect(uploadExpenseApi(payload)).resolves.toEqual({});
    });
  });
});
