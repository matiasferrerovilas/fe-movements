import { Col, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { MovementItem } from "@/models/Movement";
import {
  MovementItemUnitEnum,
  getMovementItemUnitLabel,
} from "@/enums/MovementItemUnitEnum";

const { Text } = Typography;

interface MovementItemsBreakdownProps {
  items: MovementItem[];
}

export default function MovementItemsBreakdown({ items }: MovementItemsBreakdownProps) {
  const { t } = useTranslation();
  const unitLabel = getMovementItemUnitLabel(t);
  const sum = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={{ padding: "0 16px 12px" }}>
      {items.map((item) => (
        <Row key={item.id} justify="space-between" style={{ padding: "3px 0" }}>
          <Col span={16}>
            <Text style={{ fontSize: 13 }}>{item.description}</Text>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {item.quantity} {unitLabel[item.unit as MovementItemUnitEnum] ?? item.unit}
            </Text>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Text style={{ fontSize: 13 }}>${item.price.toFixed(2)}</Text>
          </Col>
        </Row>
      ))}
      <Row
        justify="space-between"
        style={{ padding: "4px 0 0", marginTop: 4, borderTop: "1px solid #f0f0f0" }}
      >
        <Col>
          <Text strong style={{ fontSize: 12 }}>
            {t("movements.items.total")}
          </Text>
        </Col>
        <Col>
          <Text strong style={{ fontSize: 12 }}>
            ${sum.toFixed(2)}
          </Text>
        </Col>
      </Row>
    </div>
  );
}
