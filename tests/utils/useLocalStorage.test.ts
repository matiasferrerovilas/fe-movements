import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/utils/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("devuelve el valor inicial cuando no hay nada guardado", () => {
    const { result } = renderHook(() => useLocalStorage("mi-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("lee el valor ya guardado en localStorage al montar", () => {
    window.localStorage.setItem("mi-key", JSON.stringify(["ARS", "USD"]));
    const { result } = renderHook(() => useLocalStorage<string[]>("mi-key", []));
    expect(result.current[0]).toEqual(["ARS", "USD"]);
  });

  it("actualiza el estado y persiste en localStorage al llamar setValue", () => {
    const { result } = renderHook(() => useLocalStorage("mi-key", "default"));

    act(() => {
      result.current[1]("nuevo valor");
    });

    expect(result.current[0]).toBe("nuevo valor");
    expect(window.localStorage.getItem("mi-key")).toBe(
      JSON.stringify("nuevo valor"),
    );
  });

  it("acepta un updater funcional, igual que useState", () => {
    const { result } = renderHook(() =>
      useLocalStorage<string[]>("mi-key", ["ARS"]),
    );

    act(() => {
      result.current[1]((prev) => [...prev, "USD"]);
    });

    expect(result.current[0]).toEqual(["ARS", "USD"]);
  });

  it("cae al valor inicial si el contenido guardado es JSON inválido", () => {
    window.localStorage.setItem("mi-key", "{esto no es json");
    const { result } = renderHook(() => useLocalStorage("mi-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("no rompe si localStorage.setItem lanza (ej. cuota excedida)", () => {
    const setItemSpy = vi
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    const { result } = renderHook(() => useLocalStorage("mi-key", "default"));

    act(() => {
      result.current[1]("otro valor");
    });

    expect(result.current[0]).toBe("otro valor");

    setItemSpy.mockRestore();
  });
});
