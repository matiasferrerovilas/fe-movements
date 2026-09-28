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

const COL_PADDING = "8px 16px";

export default function MovementTableDesktop({
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
    <>
      <Card
        style={{ marginBottom: 8, borderRadius: 6 }}
        styles={{ body: { padding: COL_PADDING } }}
      >
        <Row justify="center" align="middle">
          <Col span={1} />
          <Col span={2}>{t("movements.columnDate")}</Col>
          <Col span={2}>{t("movements.columnCategory")}</Col>
          <Col span={2}>{t("movements.columnBank")}</Col>
          <Col span={2}>{t("movements.columnGroup")}</Col>
          <Col span={2}>{t("movements.columnLoadedBy")}</Col>
          <Col span={2}>{t("movements.columnType")}</Col>
          <Col span={3}>{t("movements.columnDescription")}</Col>
          <Col span={2} style={{ textAlign: "center" }}>{t("movements.columnInstallments")}</Col>
          <Col span={3}>{t("movements.columnAmount")}</Col>
          <Col span={2} style={{ textAlign: "right" }}>
            {t("movements.columnActions")}
          </Col>
        </Row>
      </Card>

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
                styles={{ body: { padding: COL_PADDING } }}
              >
                {record.isPendingRemoval && <PendingDeleteIndicator />}
                <Row justify="center" align="middle">
                  <Col span={1} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(record.id)}
                      onChange={() => onToggleSelect(record.id)}
                      aria-label={t("movements.bulk.selectRowAriaLabel")}
                    />
                  </Col>
                  <Col span={2}>{record.formattedDate}</Col>
                  <Col span={2}>
                    <CategoryCircleTable categories={record.categories} />
                  </Col>
                  <Col span={2}>{capitalizeFirst(record.bank)}</Col>
                  <Col span={2}>{capitalizeFirst(record.metadata.workspace.name)}</Col>
                  <Col span={2}>{capitalizeFirst(record.metadata.owner.givenName ?? "")}</Col>
                  <Col span={2}>
                    {typeEnumLabel[record.type as TypeEnum] ?? record.type}
                  </Col>
                  <Col span={3}>{record.description}</Col>
                  <Col span={2} style={{ textAlign: "center" }}>{record.installments}</Col>
                  <Col span={3}>
                    <Text>{`${record.amountSign}$${Math.abs(record.amount).toFixed(2)}`}</Text>
                    <Tag color="blue" style={{ marginLeft: 6 }}>
                      {record.currency?.symbol ?? "-"}
                    </Tag>
                  </Col>
                  <Col span={2} style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
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
                  </Col>
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
    </>
  );
}
