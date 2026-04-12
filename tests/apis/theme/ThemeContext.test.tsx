import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../../../src/apis/theme/ThemeProvider";
import { useTheme } from "../../../src/apis/theme/ThemeContext";

// ── Consumer component ──────────────────────────────────────────────────────

function ThemeConsumer() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="mode">{isDark ? "dark" : "light"}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  );
}

// ── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  document.body.removeAttribute("data-theme");
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ThemeProvider / useTheme", () => {
  describe("valor inicial — localStorage", () => {
    it("arranca en dark cuando localStorage tiene 'dark'", () => {
      localStorage.setItem("theme", "dark");
      renderWithProvider();
      expect(screen.getByTestId("mode").textContent).toBe("dark");
    });

    it("arranca en light cuando localStorage tiene 'light'", () => {
      localStorage.setItem("theme", "light");
      renderWithProvider();
      expect(screen.getByTestId("mode").textContent).toBe("light");
    });
  });

  describe("valor inicial — prefers-color-scheme (sin localStorage)", () => {
    it("arranca en dark cuando el sistema prefiere dark", () => {
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      renderWithProvider();
      expect(screen.getByTestId("mode").textContent).toBe("dark");
    });

    it("arranca en light cuando el sistema prefiere light", () => {
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      renderWithProvider();
      expect(screen.getByTestId("mode").textContent).toBe("light");
    });

    it("localStorage tiene precedencia sobre prefers-color-scheme", () => {
      localStorage.setItem("theme", "light");
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      renderWithProvider();
      expect(screen.getByTestId("mode").textContent).toBe("light");
    });
  });

  describe("toggleTheme", () => {
    it("cambia de light a dark al hacer toggle", async () => {
      localStorage.setItem("theme", "light");
      const user = userEvent.setup();
      renderWithProvider();

      expect(screen.getByTestId("mode").textContent).toBe("light");
      await user.click(screen.getByRole("button", { name: "toggle" }));
      expect(screen.getByTestId("mode").textContent).toBe("dark");
    });

    it("cambia de dark a light al hacer toggle", async () => {
      localStorage.setItem("theme", "dark");
      const user = userEvent.setup();
      renderWithProvider();

      expect(screen.getByTestId("mode").textContent).toBe("dark");
      await user.click(screen.getByRole("button", { name: "toggle" }));
      expect(screen.getByTestId("mode").textContent).toBe("light");
    });

    it("persiste el nuevo valor en localStorage al hacer toggle", async () => {
      localStorage.setItem("theme", "light");
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole("button", { name: "toggle" }));
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("setea data-theme en document.body al hacer toggle", async () => {
      localStorage.setItem("theme", "light");
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole("button", { name: "toggle" }));
      expect(document.body.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("data-theme en body", () => {
    it("setea data-theme=light en el mount cuando arranca en light", () => {
      localStorage.setItem("theme", "light");
      renderWithProvider();
      expect(document.body.getAttribute("data-theme")).toBe("light");
    });

    it("setea data-theme=dark en el mount cuando arranca en dark", () => {
      localStorage.setItem("theme", "dark");
      renderWithProvider();
      expect(document.body.getAttribute("data-theme")).toBe("dark");
    });
  });
});
