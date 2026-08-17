import { App, Button, Card, Col, Collapse, Flex, Grid, Input, Row, Segmented, Select, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MovementFilters } from "@/routes/movements";
import { TypeEnum, getTypeEnumLabel } from "@/enums/TypeEnum";
import { CurrencyEnum } from "@/enums/CurrencyEnum";
import { useCategory } from "@/apis/hooks/useCategory";
import { exportMovementsToCsv } from "@/apis/movement/exportMovements";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import FilterOutlined from "@ant-design/icons/FilterOutlined";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import RiseOutlined from "@ant-design/icons/RiseOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useBanks } from "@/apis/hooks/useBank";
import { capitalizeFirst } from "@/utils/stringFunctions";

const { Option } = Select;
const { Text } = Typography;

interface Props {
  onFiltersChange: (filters: MovementFilters) => void;
  initialFilters: MovementFilters;
  AddEditMovementModal: React.ComponentType<{ block?: boolean }>;
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Flex vertical gap={4}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export default function MovementFilters({
  onFiltersChange,
  initialFilters,
  AddEditMovementModal,
}: Props) {
  const { t } = useTranslation();
  const typeEnumLabel = getTypeEnumLabel(t);
  // Las categorías se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: categories = [] } = useCategory();
  const [filters, setFilters] = useState<MovementFilters>(initialFilters);
  const { data: currencies = [] } = useCurrency();
  const { data: banks = [] } = useBanks();
  const { message } = App.useApp();
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const count = await exportMovementsToCsv(filters, t);
      if (count === 0) message.info(t("movements.exportNothingToExport"));
    } catch {
      message.error(t("movements.exportFailed"));
    } finally {
      setExporting(false);
    }
  }, [filters, message, t]);

  const handleChange = useCallback(
    (
      key: keyof MovementFilters,
      value: string | boolean | null | string[] | TypeEnum[],
    ) => setFilters((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleLiveChange = useCallback(
    (value: boolean) => setFilters((prev) => ({ ...prev, isLive: value })),
    [],
  );

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const segmentedOptions = useMemo(
    () => [
      {
        label: (
          <span>
            <RiseOutlined /> {t("movements.current")}
          </span>
        ),
        value: true,
      },
      {
        label: (
          <span>
            <HistoryOutlined /> {t("movements.historical")}
          </span>
        ),
        value: false,
      },
    ],
    [t],
  );
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const Modal = useMemo(() => <AddEditMovementModal block={isMobile} />, [AddEditMovementModal, isMobile]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "stretch" : "space-between",
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: 30,
          gap: 12,
        }}
      >
        <Segmented
          options={segmentedOptions}
          value={filters.isLive}
          onChange={handleLiveChange}
          size="large"
          shape="round"
          block={isMobile}
        />
        <Flex gap={12} vertical={isMobile}>
          <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport} block={isMobile}>
            {t("movements.exportCsv")}
          </Button>
          {Modal}
        </Flex>
      </div>

      <Collapse
        style={{ marginBottom: 16 }}
        items={[
          {
            key: "filters",
            label: (
              <Flex align="center" gap={8}>
                <FilterOutlined />
                <span>{t("movements.filters")}</span>
              </Flex>
            ),
            children: (
              <Card bordered={false} style={{ padding: 0 }}>
                <Row gutter={[16, 16]} align="bottom">
                  <Col xs={24} sm={12} md={8} lg={4}>
                    <FilterField label={t("movements.descriptionLabel")}>
                      <Input
                        placeholder={t("movements.searchPlaceholder")}
                        prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                        value={filters.description ?? ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        allowClear
                      />
                    </FilterField>
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={4}>
                    <FilterField label={t("movements.typeLabel")}>
                      <Select
                        mode="multiple"
                        value={filters.type}
                        onChange={(val) => handleChange("type", val as TypeEnum[])}
                        placeholder={t("movements.all")}
                        allowClear
                        style={{ width: "100%" }}
                      >
                        {Object.values(TypeEnum).map((type) => (
                          <Option key={type} value={type}>
                            {typeEnumLabel[type]}
                          </Option>
                        ))}
                      </Select>
                    </FilterField>
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={4}>
                    <FilterField label={t("movements.bankLabel")}>
                      <Select
                        mode="multiple"
                        value={filters.bank}
                        onChange={(val) => handleChange("bank", val as string[])}
                        placeholder={t("movements.all")}
                        allowClear
                        style={{ width: "100%" }}
                      >
                        {banks.map((bank) => (
                          <Option key={bank.id} value={bank.description}>
                            {capitalizeFirst(bank.description)}
                          </Option>
                        ))}
                      </Select>
                    </FilterField>
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={4}>
                    <FilterField label={t("movements.currencyLabel")}>
                      <Select
                        mode="multiple"
                        value={filters.currency}
                        onChange={(val) =>
                          handleChange("currency", val as CurrencyEnum[])
                        }
                        placeholder={t("movements.allFeminine")}
                        allowClear
                        style={{ width: "100%" }}
                      >
                        {currencies.map((currency) => (
                          <Option key={currency.id} value={currency.symbol}>
                            {currency.symbol}
                          </Option>
                        ))}
                      </Select>
                    </FilterField>
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={4}>
                    <FilterField label={t("movements.categoryLabel")}>
                      <Select
                        mode="multiple"
                        value={filters.categories}
                        onChange={(val) => handleChange("categories", val as string[])}
                        placeholder={t("movements.allFeminine")}
                        allowClear
                        style={{ width: "100%" }}
                      >
                        {categories.map((cat) => (
                          <Option key={cat.id} value={cat.description}>
                            {cat.description}
                          </Option>
                        ))}
                      </Select>
                    </FilterField>
                  </Col>
                </Row>
              </Card>
            ),
          },
        ]}
      />
    </>
  );
}
