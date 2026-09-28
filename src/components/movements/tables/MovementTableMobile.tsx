import { Card, Checkbox, Col, Collapse, Empty, Row, Tag, Typography } from "antd";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { useTranslation } from "react-i18next";
import type { MovementTableViewProps } from "@/components/movements/tables/types";
import { TypeEnum, getTypeEnumLabel } from "@/enums/TypeEnum";
import CategoryCircleTable from "@/components/movements/tables/CategoryCircleTable";
import { capitalizeFirst } from "@/utils/stringFunctions";
import MovementActionButtons from "@/components/movements/tables/MovementActionButtons";
import MovementItemsBreakdown from "@/components/movements/tables/MovementItemsBreakdown";
import PendingDeleteIndicator from "@/components/PendingDeleteIndicator";

const { Text } = Typography;

export default function MovementTableMobile({
  movements,
  onDelete,
  getCardStyle,
  selectedIds,
  onToggleSelect,
  expandedIds,
  onToggleExpand,
}: MovementTableViewProps) {
  const { t } = useTranslation();
  const typeEnumLabel = getTypeEnumLabel(t);

  return (
    <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
      {movements.length === 0 ? (
        <Empty description={t("movements.noMovements")} style={{ padding: "40px 0" }} />
      ) : (
        movements.map((record, index) => {
          const hasItems = record.items.length > 0;
          const isExpanded = hasItems && expandedIds.has(record.id);
          return (
            <Card
              key={record.id}
              hoverable
              className="step-enter-right"
              onClick={() => hasItems && onToggleExpand(record.id)}
              style={{
                position: "relative",
                cursor: hasItems ? "pointer" : "default",
                ...getCardStyle(record),
                animationDelay: `${Math.min(index, 9) * 40}ms`,
              }}
              styles={{ body: { padding: "10px 12px" } }}
            >
              {record.isPendingRemoval && <PendingDeleteIndicator />}
              <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
                <Checkbox
                  checked={selectedIds.has(record.id)}
                  onChange={() => onToggleSelect(record.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t("movements.bulk.selectRowAriaLabel")}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.formattedDate}
                  </Text>
                </Checkbox>
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
                  <CategoryCircleTable categories={record.categories} />
                </Col>
                <Col>
                  <Tag>{capitalizeFirst(record.bank)}</Tag>
                </Col>
                <Col>
                  <Tag>{typeEnumLabel[record.type as TypeEnum] ?? record.type}</Tag>
                </Col>
                {record.cuotasTotales != null && record.cuotasTotales > 0 && (
                  <Col>
                    <Tag color="orange">
                      {t("movements.installmentsTag", { installments: record.installments })}
                    </Tag>
                  </Col>
                )}
              </Row>

              <Row justify="space-between" align="middle">
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {capitalizeFirst(record.metadata.workspace.name)} ·{" "}
                  {capitalizeFirst(record.metadata.owner.givenName ?? "")}
                </Text>
                <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center" }}>
                  {hasItems && (
                    <DownOutlined
                      onClick={() => onToggleExpand(record.id)}
                      rotate={isExpanded ? 180 : 0}
                      style={{
                        fontSize: 12,
                        color: "gray",
                        marginRight: 10,
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                    />
                  )}
                  <MovementActionButtons record={record} onDelete={onDelete} />
                </div>
              </Row>

              {hasItems && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Collapse
                    ghost
                    bordered={false}
                    activeKey={isExpanded ? ["items"] : []}
                    items={[
                      {
                        key: "items",
                        collapsible: "disabled",
                        showArrow: false,
                        styles: {
                          header: { display: "none", padding: 0 },
                          body: { padding: 0 },
                        },
                        label: null,
                        children: <MovementItemsBreakdown items={record.items} />,
                      },
                    ]}
                  />
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
