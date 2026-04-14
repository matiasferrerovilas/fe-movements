import { useMemo } from "react";
import { Grid, Pagination, Row, Tag } from "antd";
import type { Movement } from "../../../models/Movement";
import type { MovementFilters } from "../../../routes/movement";
import type { FormattedMovement } from "./types";
import { useDeleteMovement, useMovement } from "../../../apis/hooks/useMovement";
import { usePagination } from "../../../apis/hooks/usePagination";
import dayjs from "dayjs";
import { TypeEnum } from "../../../enums/TypeExpense";
import { useMovementSubscription } from "../../../apis/websocket/useMovementSubscription";
import { ColorEnum } from "../../../enums/ColorEnum";
import MovementTableDesktop from "./MovementTableDesktop";
import MovementTableTablet from "./MovementTableTablet";
import MovementTableMobile from "./MovementTableMobile";

const { useBreakpoint } = Grid;

interface MovementTableProps {
  filters: MovementFilters;
}

export default function MovementTable({ filters }: MovementTableProps) {
  const { page, goToPage, pageSize, changePageSize } = usePagination();
  const screens = useBreakpoint();

  // Breakpoints: mobile < 768px, tablet 768-991px, desktop >= 992px
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = !!screens.lg;

  useMovementSubscription();

  const deleteMutation = useDeleteMovement();

  const { data: movements = { content: [], totalElements: 0, totalPages: 0 } } =
    useMovement(filters, page, pageSize);

  const handleDelete = (id: number) => deleteMutation.mutate(id);

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
      };
    });
  }, [movements.content]);

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
  });

  const viewProps = {
    movements: formattedMovements,
    onDelete: handleDelete,
    getCardStyle,
  };

  return (
    <>
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
    </>
  );
}
