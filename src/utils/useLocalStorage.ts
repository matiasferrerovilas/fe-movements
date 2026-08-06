import { useCallback, useState } from "react";

/**
 * Persiste un valor en localStorage con la misma API que useState.
 * Uso pensado para decisiones de UI que no requieren backend (filtros, preferencias, etc.).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // localStorage puede fallar (modo privado, cuota excedida, etc.) — se ignora
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
