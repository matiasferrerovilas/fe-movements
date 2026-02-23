import React, { useMemo } from "react";
import { Card, Col, Row, Tag, Typography } from "antd";
import DeleteTwoTone from "@ant-design/icons/DeleteTwoTone";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import type { Movement } from "../../../models/Movement";
import type { MovementFilters } from "../../../routes/movement";
import { useMovement } from "../../../apis/hooks/useMovement";
import { usePagination } from "../../../apis/hooks/usePagination";
import dayjs from "dayjs";
import { TypeEnum } from "../../../enums/TypeExpense";
import { useMovementSubscription } from "../../../apis/websocket/useMovementSubscription";
import { useMutation } from "@tanstack/react-query";
import { deleteExpenseApi } from "../../../apis/movement/ExpenseApi";
import { BankEnumHelper } from "../../../enums/BankEnum";
import { EditTwoTone } from "@ant-design/icons";
import CategoryCircleTable from "./CategoryCircleTable";
import { capitalizeFirst } from "../../utils/stringFunctions";
import { ColorEnum } from "../../../enums/ColorEnum";
const { Text } = Typography;

const DEFAULT_PAGE_SIZE = 25;

interface MovementTableProps {
  filters: MovementFilters;
}

interface FormattedMovement extends Movement {
  formattedDate: string;
  currencySymbol: React.ReactNode;
  installments: string;
  isDebit: boolean;
  amountColor: string;
  amountSign: string;
}

export default function MovementTable({ filters }: MovementTableProps) {
  const { page, nextPage, prevPage, canGoPrev } = usePagination();
  useMovementSubscription();

  const uploadMutation = useMutation({
    mutationFn: (id: number) => {
      return deleteExpenseApi(id);
    },
    onSuccess: () => {
      console.debug("✅ Movimiento eliminado correctamente");
    },
    onError: (err) => {
      console.error("❌ Error eliminado el movimiento", err);
    },
  });

  const {
    data: movements = { content: [], totalElements: 0, totalPages: 0 },
    isFetching,
  } = useMovement(filters, page, DEFAULT_PAGE_SIZE);

  const handleDelete = (id: number) => {
    uploadMutation.mutate(id);
  };
  const formattedMovements = useMemo<FormattedMovement[]>(() => {
    return movements.content.map((m) => {
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

  const loadingConfig = useMemo(
    () => ({
      spinning: isFetching,
      indicator: <LoadingOutlined style={{ fontSize: 80 }} spin />,
    }),
    [isFetching],
  );

  const paginationConfig = useMemo(
    () => ({
      showSizeChanger: false,
      defaultPageSize: DEFAULT_PAGE_SIZE,
      total: movements?.totalElements || 0,
      current: page + 1,
      onChange: (p: number) => {
        if (p - 1 > page) nextPage();
        else if (p - 1 < page && canGoPrev) prevPage();
      },
    }),
    [movements?.totalElements, page, nextPage, prevPage, canGoPrev],
  );
  const COL_PADDING = "8px 16px";

  return (
    <>
      <Card
        hoverable
        style={{
          marginBottom: 8,
          borderRadius: 6,
          transition: "all 0.3s",
          marginLeft: 0,
          marginRight: 0,
        }}
        styles={{ body: { padding: COL_PADDING } }}
      >
        <Row justify="center" align="middle">
          <Col span={2}>Fecha</Col>
          <Col span={2}>Categoria</Col>
          <Col span={2}>Banco</Col>
          <Col span={2}>Grupo</Col>
          <Col span={2}>Cargado por</Col>
          <Col span={2}>Tipo</Col>
          <Col span={4}>Descripcion</Col>
          <Col span={1}>Cuotas</Col>
          <Col span={2}>Monto</Col>
          <Col span={1}>Moneda</Col>
          <Col span={3} style={{ textAlign: "right" }}>
            Acciones
          </Col>
        </Row>
      </Card>
      <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
        {formattedMovements?.map((record) => (
          <Card
            key={record.id}
            hoverable
            style={{
              marginBottom: 8,
              backgroundColor:
                record.type === TypeEnum.DEBITO ||
                record.type === TypeEnum.CREDITO
                  ? ColorEnum.ROJO_FALTA_PAGO
                  : ColorEnum.VERDE_PAGADO,
              borderColor:
                record.type === TypeEnum.DEBITO ||
                record.type === TypeEnum.CREDITO
                  ? ColorEnum.ROJO_FALTA_PAGO_BORDE
                  : ColorEnum.VERDE_PAGADO_BORDE,
              borderRadius: 6,
              transition: "all 0.3s",
              marginLeft: 0,
              marginRight: 0,
            }}
            styles={{ body: { padding: COL_PADDING } }}
          >
            <Row justify="center" align="middle">
              <Col span={2}>{dayjs(record.date).format("DD/MM/YYYY")}</Col>
              <Col span={2}>
                <CategoryCircleTable category={record.category?.description} />
              </Col>
              <Col span={2}>
                {capitalizeFirst(BankEnumHelper.fromString(record.bank))}
              </Col>
              <Col span={2}>{capitalizeFirst(record.account.name)}</Col>
              <Col span={2}>{capitalizeFirst(record.owner.email)}</Col>
              <Col span={2}>{capitalizeFirst(record.type)}</Col>
              <Col span={4}>{record.description}</Col>
              <Col span={1}>{record.installments}</Col>
              <Col span={2}>
                <Text>
                  {`${record.amountSign} $${Math.abs(record.amount).toFixed(2)}`}
                </Text>
              </Col>
              <Col span={1}>{record.currency?.symbol ?? "-"}</Col>
              <Col span={3} style={{ textAlign: "right" }}>
                <DeleteTwoTone
                  style={{ fontSize: 20, cursor: "pointer", marginRight: 8 }}
                  onClick={() => handleDelete(record.id)}
                />
                <EditTwoTone
                  style={{ fontSize: 20, cursor: "pointer" }}
                  onClick={() => handleDelete(record.id)}
                />
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </>
  );
}
