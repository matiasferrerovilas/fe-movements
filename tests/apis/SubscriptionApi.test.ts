import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import dayjs from "dayjs";
import {
  addSubscriptionApi,
  updateSubscriptionApi,
} from "../../src/apis/SubscriptionApi";
import type { ServiceToAdd } from "../../src/apis/SubscriptionApi";
import type { ServiceToUpdate } from "../../src/models/Service";

// ── Captura del payload enviado al backend ───────────────────────────────────

let capturedAddBody: Record<string, unknown> = {};
let capturedUpdateBody: Record<string, unknown> = {};

const server = setupServer(
  http.post("http://localhost:8080/subscriptions", async ({ request }) => {
    capturedAddBody = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 1 }, { status: 201 });
  }),
  http.patch("http://localhost:8080/subscriptions/:id", async ({ request }) => {
    capturedUpdateBody = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 1 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  capturedAddBody = {};
  capturedUpdateBody = {};
});
afterAll(() => server.close());

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeServiceToAdd(lastPayment: Date | null): ServiceToAdd {
  return {
    amount: 999,
    description: "Netflix",
    currency: { symbol: "ARS" },
    lastPayment,
    isPaid: true,
    groupId: 10,
  };
}

function makeServiceToUpdate(lastPayment: Date | null): ServiceToUpdate {
  return {
    id: 42,
    changes: {
      amount: 999,
      description: "Netflix",
      group: "Familia",
      lastPayment,
    },
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SubscriptionApi — serialización de lastPayment", () => {
  describe("addSubscriptionApi (crear suscripción)", () => {
    it("envía lastPayment en formato YYYY-MM-DD usando la hora local del dispositivo", async () => {
      // Caso crítico: 23:50 en UTC+2 (ej: Madrid) — sin fix el UTC da día siguiente
      const localDate = new Date(2026, 2, 31, 23, 50, 0); // 31 mar 2026 23:50 local
      await addSubscriptionApi(makeServiceToAdd(localDate));

      expect(capturedAddBody.lastPayment).toBe("2026-03-31");
    });

    it("no envía timestamp ni zona horaria en lastPayment", async () => {
      const localDate = new Date(2026, 5, 15, 14, 0, 0);
      await addSubscriptionApi(makeServiceToAdd(localDate));

      expect(typeof capturedAddBody.lastPayment).toBe("string");
      expect(capturedAddBody.lastPayment as string).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("envía lastPayment como null cuando no se provee fecha", async () => {
      await addSubscriptionApi(makeServiceToAdd(null));

      expect(capturedAddBody.lastPayment).toBeNull();
    });

    it("coincide con dayjs(date).format('YYYY-MM-DD') — fecha del calendario local", async () => {
      const localDate = new Date(2026, 0, 1, 0, 30, 0); // 1 ene 2026 a las 00:30 local
      const expected = dayjs(localDate).format("YYYY-MM-DD");
      await addSubscriptionApi(makeServiceToAdd(localDate));

      expect(capturedAddBody.lastPayment).toBe(expected);
    });
  });

  describe("updateSubscriptionApi (actualizar suscripción)", () => {
    it("envía lastPayment en formato YYYY-MM-DD usando la hora local del dispositivo", async () => {
      const localDate = new Date(2026, 2, 31, 23, 50, 0); // 31 mar 2026 23:50 local
      await updateSubscriptionApi(makeServiceToUpdate(localDate));

      expect(capturedUpdateBody.lastPayment).toBe("2026-03-31");
    });

    it("no envía timestamp ni zona horaria en lastPayment", async () => {
      const localDate = new Date(2026, 11, 25, 9, 0, 0);
      await updateSubscriptionApi(makeServiceToUpdate(localDate));

      expect(typeof capturedUpdateBody.lastPayment).toBe("string");
      expect(capturedUpdateBody.lastPayment as string).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("envía lastPayment como null cuando no se provee fecha", async () => {
      await updateSubscriptionApi(makeServiceToUpdate(null));

      expect(capturedUpdateBody.lastPayment).toBeNull();
    });

    it("coincide con dayjs(date).format('YYYY-MM-DD') — fecha del calendario local", async () => {
      const localDate = new Date(2026, 0, 1, 0, 30, 0);
      const expected = dayjs(localDate).format("YYYY-MM-DD");
      await updateSubscriptionApi(makeServiceToUpdate(localDate));

      expect(capturedUpdateBody.lastPayment).toBe(expected);
    });
  });
});
