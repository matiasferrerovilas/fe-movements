import { Card, Col, Empty, Row, Tag, Typography } from "antd";
import type { MovementTableViewProps } from "./types";
import { TypeEnum, TypeEnumLabel } from "../../../enums/TypeExpense";
import CategoryCircleTable from "./CategoryCircleTable";
import { capitalizeFirst } from "../../utils/stringFunctions";
import MovementActionButtons from "./MovementActionButtons";

const { Text } = Typography;

const COL_PADDING = "8px 12px";

export default function MovementTableTablet({
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
          <Col span={3}>Fecha</Col>
          <Col span={3}>Categoría</Col>
          <Col span={3}>Banco</Col>
          <Col span={3}>Tipo</Col>
          <Col span={5}>Descripción</Col>
          <Col span={4}>Monto</Col>
          <Col span={3} style={{ textAlign: "right" }}>
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
                <Col span={3}>{record.formattedDate}</Col>
                <Col span={3}>
                  <CategoryCircleTable category={record.category ?? undefined} />
                </Col>
                <Col span={3}>{capitalizeFirst(record.bank)}</Col>
                <Col span={3}>
                  {TypeEnumLabel[record.type as TypeEnum] ?? record.type}
                </Col>
                <Col span={5} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {record.description}
                </Col>
                <Col span={4}>
                  <Text style={{ color: record.amountColor }}>
                    {`${record.amountSign}$${Math.abs(record.amount).toFixed(2)}`}
                    <Text type="secondary" style={{ marginLeft: 4, fontSize: 11 }}>
                      {record.currency?.symbol ?? ""}
                    </Text>
                  </Text>
                  {record.cuotasTotales != null && record.cuotasTotales > 0 && (
                    <Tag color="orange" style={{ marginLeft: 4, fontSize: 10, padding: "0 4px" }}>
                      {record.installments}
                    </Tag>
                  )}
                </Col>
                <Col span={3} style={{ textAlign: "right" }}>
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
