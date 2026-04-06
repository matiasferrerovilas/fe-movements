import React, { useMemo } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Grid,
  Pagination,
  Popconfirm,
  Row,
  Tag,
  Typography,
} from "antd";
import type { Movement } from "../../../models/Movement";
import type { MovementFilters } from "../../../routes/movement";
import { useMovement } from "../../../apis/hooks/useMovement";
import { usePagination } from "../../../apis/hooks/usePagination";
import dayjs from "dayjs";
import { TypeEnum, TypeEnumLabel } from "../../../enums/TypeExpense";
import { useMovementSubscription } from "../../../apis/websocket/useMovementSubscription";
import { useMutation } from "@tanstack/react-query";
import { deleteExpenseApi } from "../../../apis/movement/ExpenseApi";
import { DeleteOutlined } from "@ant-design/icons";
import CategoryCircleTable from "./CategoryCircleTable";
import { capitalizeFirst } from "../../utils/stringFunctions";
import { ColorEnum } from "../../../enums/ColorEnum";
import EditMovementModal from "../../modals/movements/EditMovementModal";

const { Text } = Typography;
const { useBreakpoint } = Grid;

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
  const { page, goToPage, pageSize, changePageSize } = usePagination();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useMovementSubscription();

  const uploadMutation = useMutation({
    mutationFn: (id: number) => deleteExpenseApi(id),
    onSuccess: () => console.debug("✅ Movimiento eliminado correctamente"),
    onError: (err) => console.error("❌ Error eliminado el movimiento", err),
  });

  const { data: movements = { content: [], totalElements: 0, totalPages: 0 } } =
    useMovement(filters, page, pageSize);

  const handleDelete = (id: number) => uploadMutation.mutate(id);

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

  const COL_PADDING = "8px 16px";

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

  const ActionButtons = ({ record }: { record: FormattedMovement }) => (
    <>
      <Popconfirm
        title="¿Estás seguro de que quieres eliminar el movimiento?"
        onConfirm={() => handleDelete(record.id)}
        okText="Sí"
        cancelText="No"
        placement="topRight"
      >
        <Button
          type="text"
          icon={
            <DeleteOutlined
              style={{ fontSize: 20, cursor: "pointer", marginRight: 8 }}
            />
          }
          style={{
            color: "gray",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 18,
          }}
          title="Eliminar el movimiento"
        />
      </Popconfirm>
      <EditMovementModal movement={record} />
    </>
  );

  return (
    <>
      {!isMobile && (
        <>
          <Card
            style={{ marginBottom: 8, borderRadius: 6 }}
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
            {formattedMovements.length === 0 ? (
              <Empty description="Sin movimientos" style={{ padding: "40px 0" }} />
            ) : (
              formattedMovements.map((record, index) => (
                <Card
                  key={record.id}
                  hoverable
                  className="step-enter-right"
                  style={{ ...getCardStyle(record), animationDelay: `${Math.min(index, 9) * 40}ms` }}
                  styles={{ body: { padding: COL_PADDING } }}
                >
                  <Row justify="center" align="middle">
                    <Col span={2}>{record.formattedDate}</Col>
                    <Col span={2}>
                      <CategoryCircleTable
                        category={record.category?.description}
                      />
                    </Col>
                    <Col span={2}>
                      {capitalizeFirst(record.bank)}
                    </Col>
                    <Col span={2}>{capitalizeFirst(record.account.name)}</Col>
                    <Col span={2}>{capitalizeFirst(record.owner.email)}</Col>
                    <Col span={2}>{TypeEnumLabel[record.type as TypeEnum] ?? record.type}</Col>
                    <Col span={4}>{record.description}</Col>
                    <Col span={1}>{record.installments}</Col>
                    <Col span={2}>
                      <Text>{`${record.amountSign} $${Math.abs(record.amount).toFixed(2)}`}</Text>
                    </Col>
                    <Col span={1}>{record.currency?.symbol ?? "-"}</Col>
                    <Col span={3} style={{ textAlign: "right" }}>
                      <ActionButtons record={record} />
                    </Col>
                  </Row>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {isMobile && (
        <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
          {formattedMovements.length === 0 ? (
            <Empty description="Sin movimientos" style={{ padding: "40px 0" }} />
          ) : (
            formattedMovements.map((record, index) => (
              <Card
                key={record.id}
                hoverable
                className="step-enter-right"
                style={{ ...getCardStyle(record), animationDelay: `${Math.min(index, 9) * 40}ms` }}
                styles={{ body: { padding: "10px 12px" } }}
              >
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 6 }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.formattedDate}
                  </Text>
                  <Text
                    strong
                    style={{ color: record.amountColor, fontSize: 16 }}
                  >
                    {`${record.amountSign} $${Math.abs(record.amount).toFixed(2)}`}
                    <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>
                      {record.currency?.symbol ?? "-"}
                    </Tag>
                  </Text>
                </Row>

                {record.description && (
                  <Text style={{ display: "block", marginBottom: 4 }}>
                    {record.description}
                  </Text>
                )}

                <Row gutter={[8, 4]} style={{ marginBottom: 4 }}>
                  <Col>
                    <CategoryCircleTable
                      category={record.category?.description}
                    />
                  </Col>
                  <Col>
                    <Tag>
                      {capitalizeFirst(record.bank)}
                    </Tag>
                  </Col>
                  <Col>
                    <Tag>{TypeEnumLabel[record.type as TypeEnum] ?? record.type}</Tag>
                  </Col>
                  {record.cuotasTotales != null && record.cuotasTotales > 0 && (
                    <Col>
                      <Tag color="orange">{record.installments} cuotas</Tag>
                    </Col>
                  )}
                </Row>

                <Row justify="space-between" align="middle">
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {capitalizeFirst(record.account.name)} ·{" "}
                    {capitalizeFirst(record.owner.email)}
                  </Text>
                  <div>
                    <ActionButtons record={record} />
                  </div>
                </Row>
              </Card>
            ))
          )}
        </div>
      )}

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
