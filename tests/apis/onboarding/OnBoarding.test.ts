import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { finishOnboarding } from "../../../src/apis/onboarding/OnBoarding";
import type { OnboardingForm } from "../../../src/apis/onboarding/OnBoarding";

// ── MSW ────────────────────────────────────────────────────────────────────

const server = setupServer(
  http.post("http://localhost:8080/onboarding", () =>
    HttpResponse.json({ success: true }, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Tests ──────────────────────────────────────────────────────────────────

const validForm: OnboardingForm = {
  accountsToAdd: ["Familia"],
  userType: "PERSONAL",
  onBoardingAmount: {
    amount: 100000,
    bank: "GALICIA",
    currency: "ARS",
    accountToAdd: "Familia",
  },
};

describe("finishOnboarding", () => {
  it("hace POST a /onboarding con el payload correcto", async () => {
    let capturedBody: unknown;
    server.use(
      http.post("http://localhost:8080/onboarding", async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ success: true });
      }),
    );

    await finishOnboarding(validForm);

    expect(capturedBody).toEqual(validForm);
  });

  it("retorna la respuesta del servidor en caso de éxito", async () => {
    const result = await finishOnboarding(validForm);
    expect(result).toEqual({ success: true });
  });

  it("lanza un error cuando el servidor responde con 500", async () => {
    server.use(
      http.post("http://localhost:8080/onboarding", () =>
        HttpResponse.json({ message: "Error interno" }, { status: 500 }),
      ),
    );

    await expect(finishOnboarding(validForm)).rejects.toThrow();
  });

  it("lanza un error cuando el servidor responde con 400", async () => {
    server.use(
      http.post("http://localhost:8080/onboarding", () =>
        HttpResponse.json({ message: "Datos inválidos" }, { status: 400 }),
      ),
    );

    await expect(finishOnboarding(validForm)).rejects.toThrow();
  });
});
