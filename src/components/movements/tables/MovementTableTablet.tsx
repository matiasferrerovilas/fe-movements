import { Card, Checkbox, Col, Empty, Row, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { MovementTableViewProps } from "@/components/movements/tables/types";
import { TypeEnum, getTypeEnumLabel } from "@/enums/TypeEnum";
import CategoryCircleTable from "@/components/movements/tables/CategoryCircleTable";
import { capitalizeFirst } from "@/utils/stringFunctions";
import MovementActionButtons from "@/components/movements/tables/MovementActionButtons";

const { Text } = Typography;

const COL_PADDING = "8px 12px";

export default function MovementTableTablet({
  movements,
  onDelete,
  getCardStyle,
  selectedIds,
  onToggleSelect,
}: MovementTableViewProps) {
  const { t } = useTranslation();
  const typeEnumLabel = getTypeEnumLabel(t);

  return (
    <>
      <Card
        style={{ marginBottom: 8, borderRadius: 6 }}
        styles={{ body: { padding: COL_PADDING } }}
      >
        <Row justify="center" align="middle">
          <Col span={2} />
          <Col span={3}>{t("movements.columnDate")}</Col>
          <Col span={3}>{t("movements.columnCategory")}</Col>
          <Col span={3}>{t("movements.columnBank")}</Col>
          <Col span={3}>{t("movements.columnType")}</Col>
          <Col span={4}>{t("movements.columnDescription")}</Col>
          <Col span={3}>{t("movements.columnAmount")}</Col>
          <Col span={3} style={{ textAlign: "right" }}>
            {t("movements.columnActions")}
          </Col>
        </Row>
      </Card>

      <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
        {movements.length === 0 ? (
          <Empty description={t("movements.noMovements")} style={{ padding: "40px 0" }} />
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
                <Col span={2}>
                  <Checkbox
                    checked={selectedIds.has(record.id)}
                    onChange={() => onToggleSelect(record.id)}
                    aria-label={t("movements.bulk.selectRowAriaLabel")}
                  />
                </Col>
                <Col span={3}>{record.formattedDate}</Col>
                <Col span={3}>
                  <CategoryCircleTable categories={record.categories} />
                </Col>
                <Col span={3}>{capitalizeFirst(record.bank)}</Col>
                <Col span={3}>
                  {typeEnumLabel[record.type as TypeEnum] ?? record.type}
                </Col>
                <Col span={4} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {record.description}
                </Col>
                <Col span={3}>
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
