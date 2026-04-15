import { Card, Col, Empty, Row, Tag, Typography } from "antd";
import type { MovementTableViewProps } from "./types";
import { TypeEnum, TypeEnumLabel } from "../../../enums/TypeExpense";
import CategoryCircleTable from "./CategoryCircleTable";
import { capitalizeFirst } from "../../utils/stringFunctions";
import MovementActionButtons from "./MovementActionButtons";

const { Text } = Typography;

const COL_PADDING = "8px 16px";

export default function MovementTableDesktop({
  movements,
  onDelete,
  getCardStyle,
}: MovementTableViewProps) {
  return (
    <>
      <Card
        style={{ marginBottom: 8, borderRadius: 6 }}
        styles={{ body: { padding: COL_PADDING } }}
      >
        <Row justify="center" align="middle">
          <Col span={2}>Fecha</Col>
          <Col span={2}>Categoría</Col>
          <Col span={2}>Banco</Col>
          <Col span={2}>Grupo</Col>
          <Col span={2}>Cargado por</Col>
          <Col span={2}>Tipo</Col>
          <Col span={4}>Descripción</Col>
          <Col span={2} style={{ textAlign: "center" }}>Cuotas</Col>
          <Col span={3}>Monto</Col>
          <Col span={2} style={{ textAlign: "right" }}>
            Acciones
          </Col>
        </Row>
      </Card>

      <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
        {movements.length === 0 ? (
          <Empty description="Sin movimientos" style={{ padding: "40px 0" }} />
        ) : (
          movements.map((record, index) => (
            <Card
              key={record.id}
              hoverable
              className="step-enter-right"
              style={{
                ...getCardStyle(record),
                animationDelay: `${Math.min(index, 9) * 40}ms`,
              }}
              styles={{ body: { padding: COL_PADDING } }}
            >
              <Row justify="center" align="middle">
                <Col span={2}>{record.formattedDate}</Col>
                <Col span={2}>
                  <CategoryCircleTable category={record.category ?? undefined} />
                </Col>
                <Col span={2}>{capitalizeFirst(record.bank)}</Col>
                <Col span={2}>{capitalizeFirst(record.account.name)}</Col>
                <Col span={2}>{capitalizeFirst(record.owner.givenName ?? "")}</Col>
                <Col span={2}>
                  {TypeEnumLabel[record.type as TypeEnum] ?? record.type}
                </Col>
                <Col span={4}>{record.description}</Col>
                <Col span={2} style={{ textAlign: "center" }}>{record.installments}</Col>
                <Col span={3}>
                  <Text>{`${record.amountSign}$${Math.abs(record.amount).toFixed(2)}`}</Text>
                  <Tag color="blue" style={{ marginLeft: 6 }}>
                    {record.currency?.symbol ?? "-"}
                  </Tag>
                </Col>
                <Col span={2} style={{ textAlign: "right" }}>
                  <MovementActionButtons record={record} onDelete={onDelete} />
                </Col>
              </Row>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
