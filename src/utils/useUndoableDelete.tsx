import { useCallback, useEffect, useRef, useState } from "react";
import { Button, notification } from "antd";
import { useTranslation } from "react-i18next";

type Id = number | string;

interface UseUndoableDeleteOptions<T> {
  /** Extrae un identificador único del ítem, usado para trackear el estado "pendiente de borrado". */
  getId: (item: T) => Id;
  /** Ejecuta el borrado real (llamada a la API) una vez que la ventana de deshacer expira. */
  onDelete: (item: T) => Promise<unknown> | void;
  /** Mensaje mostrado en la notificación. Por defecto: "Elemento eliminado". */
  getMessage?: (item: T) => string;
  /** Mensaje mostrado en la notificación de un borrado en lote. Por defecto: "N elementos eliminados". */
  getBulkMessage?: (items: T[]) => string;
  /**
   * Se ejecuta tras el borrado real de un lote (`requestDeleteMany`), con el resultado de cada ítem.
   * Si se provee, reemplaza la notificación de error genérica — el consumidor queda a cargo de
   * comunicar fallos parciales (ej: "3 eliminados, 1 falló").
   */
  onBulkSettled?: (items: T[], results: PromiseSettledResult<unknown>[]) => void;
  /** Milisegundos que el usuario tiene para deshacer antes de que se dispare el borrado real. */
  delayMs?: number;
}

interface UseUndoableDeleteResult<T> {
  /** Marca el ítem como "pendiente de borrado" y programa el borrado real tras la ventana de deshacer. */
  requestDelete: (item: T) => void;
  /** Igual que `requestDelete`, pero para varios ítems a la vez: una sola notificación con un único "Deshacer" para todo el lote. */
  requestDeleteMany: (items: T[]) => void;
  /** Indica si un ítem está actualmente en la ventana de deshacer (para renderizarlo "tachado"/deshabilitado). */
  isPending: (item: T) => boolean;
}

const DEFAULT_DELAY_MS = 7000;

/**
 * Hook reutilizable para borrados "deshacibles": en lugar de disparar el DELETE inmediatamente,
 * marca el ítem como pendiente, muestra una notificación con acción "Deshacer" y recién dispara
 * la llamada real si el usuario no deshace la acción dentro de la ventana de tiempo.
 *
 * El consumidor es responsable de usar `isPending(item)` para renderizar el ítem en estado
 * "pendiente de borrado" (ej: atenuado / tachado) en la lista/tabla mientras la ventana está abierta.
 */
export function useUndoableDelete<T>({
  getId,
  onDelete,
  getMessage,
  getBulkMessage,
  onBulkSettled,
  delayMs = DEFAULT_DELAY_MS,
}: UseUndoableDeleteOptions<T>): UseUndoableDeleteResult<T> {
  const { t } = useTranslation();

  const [pendingIds, setPendingIds] = useState<Set<Id>>(new Set());
  const timersRef = useRef<Map<Id, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    [],
  );

  const clearPending = useCallback((id: Id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const requestDelete = useCallback(
    (item: T) => {
      const id = getId(item);
      const notificationKey = `undoable-delete-${id}`;

      setPendingIds((prev) => new Set(prev).add(id));

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setPendingIds((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        notification.destroy(notificationKey);
        void Promise.resolve(onDelete(item)).catch(() => {
          notification.error({
            message: t("common.undo.deleteFailed"),
            placement: "bottomRight",
          });
        });
      }, delayMs);
      timersRef.current.set(id, timer);

      notification.open({
        key: notificationKey,
        message: getMessage ? getMessage(item) : t("common.undo.itemDeleted"),
        placement: "bottomRight",
        duration: delayMs / 1000,
        btn: (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              clearPending(id);
              notification.destroy(notificationKey);
            }}
          >
            {t("common.undo.undoButton")}
          </Button>
        ),
      });
    },
    [getId, onDelete, getMessage, delayMs, t, clearPending],
  );

  const requestDeleteMany = useCallback(
    (items: T[]) => {
      if (items.length === 0) return;
      const ids = items.map(getId);
      const notificationKey = `undoable-delete-bulk-${ids.join("-")}`;

      setPendingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });

      const timer = setTimeout(() => {
        ids.forEach((id) => timersRef.current.delete(id));
        setPendingIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        notification.destroy(notificationKey);
        void Promise.allSettled(items.map((item) => onDelete(item))).then((results) => {
          if (onBulkSettled) {
            onBulkSettled(items, results);
            return;
          }
          const anyFailed = results.some((r) => r.status === "rejected");
          if (anyFailed) {
            notification.error({
              message: t("common.undo.deleteFailed"),
              placement: "bottomRight",
            });
          }
        });
      }, delayMs);
      // Se registra el mismo timer bajo cada id: clearTimeout es idempotente, y así
      // `clearPending(id)` (usado por `requestDelete` individual) sigue funcionando igual
      // si se invoca sobre un ítem que forma parte de un lote pendiente.
      ids.forEach((id) => timersRef.current.set(id, timer));

      notification.open({
        key: notificationKey,
        message: getBulkMessage
          ? getBulkMessage(items)
          : t("common.undo.itemsDeleted", { count: items.length }),
        placement: "bottomRight",
        duration: delayMs / 1000,
        btn: (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              ids.forEach((id) => clearPending(id));
              notification.destroy(notificationKey);
            }}
          >
            {t("common.undo.undoButton")}
          </Button>
        ),
      });
    },
    [getId, onDelete, getBulkMessage, onBulkSettled, delayMs, t, clearPending],
  );

  const isPending = useCallback((item: T) => pendingIds.has(getId(item)), [pendingIds, getId]);

  return { requestDelete, requestDeleteMany, isPending };
}
