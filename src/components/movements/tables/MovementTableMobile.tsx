import { Card, Col, Empty, Row, Tag, Typography } from "antd";
import type { MovementTableViewProps } from "./types";
import { TypeEnum, TypeEnumLabel } from "../../../enums/TypeExpense";
import CategoryCircleTable from "./CategoryCircleTable";
import { capitalizeFirst } from "../../utils/stringFunctions";
import MovementActionButtons from "./MovementActionButtons";

const { Text } = Typography;

export default function MovementTableMobile({
  movements,
  onDelete,
  getCardStyle,
}: MovementTableViewProps) {
  return (
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
            styles={{ body: { padding: "10px 12px" } }}
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.formattedDate}
              </Text>
              <Text strong style={{ color: record.amountColor, fontSize: 16 }}>
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
                <CategoryCircleTable category={record.category ?? undefined} />
              </Col>
              <Col>
                <Tag>{capitalizeFirst(record.bank)}</Tag>
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
                {capitalizeFirst(record.owner.givenName ?? "")}
              </Text>
              <div>
                <MovementActionButtons record={record} onDelete={onDelete} />
              </div>
            </Row>
          </Card>
        ))
      )}
    </div>
  );
}
