import { useMemo, useState } from "react";
import { App, Card, Grid, Pagination, Row, Tag } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CreateMovementForm, Movement } from "@/models/Movement";
import type { MovementFilters } from "@/routes/movements";
import type { FormattedMovement } from "@/components/movements/tables/types";
import { useDeleteMovement, useMovement } from "@/apis/hooks/useMovement";
import { updateExpense } from "@/apis/movement/MovementApi";
import { usePagination } from "@/apis/hooks/usePagination";
import dayjs from "dayjs";
import { TypeEnum } from "@/enums/TypeEnum";
import { useMovementSubscription } from "@/apis/websocket/useMovementSubscription";
import { ColorEnum } from "@/enums/ColorEnum";
import MovementTableDesktop from "@/components/movements/tables/MovementTableDesktop";
import MovementTableTablet from "@/components/movements/tables/MovementTableTablet";
import MovementTableMobile from "@/components/movements/tables/MovementTableMobile";
import BulkActionsToolbar from "@/components/movements/tables/BulkActionsToolbar";
import BulkCategorizeModal from "@/components/movements/tables/BulkCategorizeModal";
import MovementsEmptyState from "@/components/movements/MovementsEmptyState";
import { useUndoableDelete } from "@/utils/useUndoableDelete";

const { useBreakpoint } = Grid;

const MOVEMENT_QUERY_KEY = "movement-history" as const;

function toMovementForm(movement: Movement, categories: string[]): CreateMovementForm {
  return {
    bank: movement.bank,
    description: movement.description,
    date: new Date(movement.date),
    currency: movement.currency?.symbol ?? "",
    amount: movement.amount,
    type: movement.type,
    cuotaActual: movement.cuotaActual ?? undefined,
    cuotasTotales: movement.cuotasTotales ?? undefined,
    categories,
  };
}

interface MovementTableProps {
  filters: MovementFilters;
}

export default function MovementTable({ filters }: MovementTableProps) {
  const { page, goToPage, pageSize, changePageSize } = usePagination();
  const screens = useBreakpoint();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // Breakpoints: mobile < 768px, tablet 768-991px, desktop >= 992px
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = !!screens.lg;

  useMovementSubscription();

  const deleteMutation = useDeleteMovement();
  const { requestDelete, isPending: isPendingRemoval } = useUndoableDelete<number>({
    getId: (id) => id,
    onDelete: (id) => deleteMutation.mutateAsync(id),
  });

  const { data: movements = { content: [], totalElements: 0, totalPages: 0 } } =
    useMovement(filters, page, pageSize);

  const hasActiveFilters =
    !!filters.description ||
    filters.type.length > 0 ||
    filters.bank.length > 0 ||
    filters.categories.length > 0 ||
    filters.currency.length > 0;

  const handleDelete = (id: number) => requestDelete(id);

  // ── Selección múltiple y acciones en lote ──────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkCategorizing, setIsBulkCategorizing] = useState(false);
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedMovements = movements.content.filter((m) => selectedIds.has(m.id));

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        selectedMovements.map((m) => deleteMutation.mutateAsync(m.id)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = results.length - failed;
      if (failed > 0) {
        void message.warning(
          t("movements.bulk.deleteSummary", { succeeded, failed }),
        );
      } else {
        void message.success(t("movements.bulk.deleteAllSuccess", { count: succeeded }));
      }
      clearSelection();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkCategorize = async (categories: string[]) => {
    setIsBulkCategorizing(true);
    try {
      const results = await Promise.allSettled(
        selectedMovements.map((m) => updateExpense(m.id, toMovementForm(m, categories))),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = results.length - failed;
      if (failed > 0) {
        void message.warning(
          t("movements.bulk.categorizeSummary", { succeeded, failed }),
        );
      } else {
        void message.success(t("movements.bulk.categorizeAllSuccess", { count: succeeded }));
      }
      void queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
      clearSelection();
      setCategorizeModalOpen(false);
    } finally {
      setIsBulkCategorizing(false);
    }
  };

  const formattedMovements = useMemo<FormattedMovement[]>(() => {
    return movements.content.map((m: Movement) => {
      const isDebit = m.type === TypeEnum.DEBITO || m.type === TypeEnum.CREDITO;
      return {
        ...m,
        formattedDate: dayjs(m.date).format("DD/MM/YYYY"),
        currencySymbol: <Tag color="blue">{m.currency?.symbol || "-"}</Tag>,
        installments: m.cuotasTotales
          ? `${m.cuotaActual ?? "-"}/${m.cuotasTotales}`
          : "-",
        isDebit,
        amountColor: isDebit ? "red" : "green",
        amountSign: isDebit ? "-" : "+",
        isPendingRemoval: isPendingRemoval(m.id),
      };
    });
  }, [movements.content, isPendingRemoval]);

  const getCardStyle = (record: FormattedMovement) => ({
    marginBottom: 8,
    backgroundColor:
      record.type === TypeEnum.DEBITO || record.type === TypeEnum.CREDITO
        ? ColorEnum.ROJO_FALTA_PAGO
        : ColorEnum.VERDE_PAGADO,
    borderColor:
      record.type === TypeEnum.DEBITO || record.type === TypeEnum.CREDITO
        ? ColorEnum.ROJO_FALTA_PAGO_BORDE
        : ColorEnum.VERDE_PAGADO_BORDE,
    borderRadius: 6,
    transition: "all 0.3s",
    marginLeft: 0,
    marginRight: 0,
    ...(record.isPendingRemoval
      ? { opacity: 0.45, filter: "grayscale(70%)", pointerEvents: "none" as const }
      : {}),
  });

  const viewProps = {
    movements: formattedMovements,
    onDelete: handleDelete,
    getCardStyle,
    selectedIds,
    onToggleSelect: handleToggleSelect,
  };

  if (!hasActiveFilters && movements.totalElements === 0) {
    return <MovementsEmptyState />;
  }

  return (
    <Card title={t("nav.movements")} style={{ marginBottom: 16, padding: 0 }}>
      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        isDeleting={isBulkDeleting}
        onBulkDelete={() => void handleBulkDelete()}
        onOpenCategorize={() => setCategorizeModalOpen(true)}
        onClearSelection={clearSelection}
      />

      {isDesktop && <MovementTableDesktop {...viewProps} />}
      {isTablet && <MovementTableTablet {...viewProps} />}
      {isMobile && <MovementTableMobile {...viewProps} />}

      <Row justify="end" style={{ marginTop: 16 }}>
        <Pagination
          showSizeChanger
          pageSizeOptions={[10, 25, 50, 100]}
          pageSize={pageSize}
          total={movements?.totalElements || 0}
          current={page + 1}
          onChange={(p: number) => goToPage(p - 1)}
          onShowSizeChange={(_current, size) => changePageSize(size)}
        />
      </Row>

      <BulkCategorizeModal
        open={categorizeModalOpen}
        count={selectedIds.size}
        isSubmitting={isBulkCategorizing}
        onClose={() => setCategorizeModalOpen(false)}
        onConfirm={(categories) => void handleBulkCategorize(categories)}
      />
    </Card>
  );
}
