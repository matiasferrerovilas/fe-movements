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
  /** Milisegundos que el usuario tiene para deshacer antes de que se dispare el borrado real. */
  delayMs?: number;
}

interface UseUndoableDeleteResult<T> {
  /** Marca el ítem como "pendiente de borrado" y programa el borrado real tras la ventana de deshacer. */
  requestDelete: (item: T) => void;
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

  const isPending = useCallback((item: T) => pendingIds.has(getId(item)), [pendingIds, getId]);

  return { requestDelete, isPending };
}
