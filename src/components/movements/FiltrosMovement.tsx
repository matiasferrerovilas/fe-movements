import { Card, Col, Flex, Grid, Input, Row, Segmented, Select, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MovementFilters } from "../../routes/movement";
import { TypeEnum, TypeEnumLabel } from "../../enums/TypeExpense";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import { useCategory } from "../../apis/hooks/useCategory";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import RiseOutlined from "@ant-design/icons/RiseOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { useCurrency } from "../../apis/hooks/useCurrency";
import { useBanks } from "../../apis/hooks/useBank";
import { capitalizeFirst } from "../utils/stringFunctions";

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

export default function FiltrosMovement({
  onFiltersChange,
  initialFilters,
  AddEditMovementModal,
}: Props) {
  // Las categorías se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: categories = [] } = useCategory();
  const [filters, setFilters] = useState<MovementFilters>(initialFilters);
  const { data: currencies = [] } = useCurrency();
  const { data: banks = [] } = useBanks();

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
            <RiseOutlined /> Actuales
          </span>
        ),
        value: true,
      },
      {
        label: (
          <span>
            <HistoryOutlined /> Históricos
          </span>
        ),
        value: false,
      },
    ],
    [],
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
        {Modal}
      </div>

      <Card title="Filtros" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={8} lg={4}>
            <FilterField label="Descripción">
              <Input
                placeholder="Buscar..."
                prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                value={filters.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                allowClear
              />
            </FilterField>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <FilterField label="Tipo">
              <Select
                mode="multiple"
                value={filters.type}
                onChange={(val) => handleChange("type", val as TypeEnum[])}
                placeholder="Todos"
                allowClear
                style={{ width: "100%" }}
              >
                {Object.values(TypeEnum).map((type) => (
                  <Option key={type} value={type}>
                    {TypeEnumLabel[type]}
                  </Option>
                ))}
              </Select>
            </FilterField>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <FilterField label="Banco">
              <Select
                mode="multiple"
                value={filters.bank}
                onChange={(val) => handleChange("bank", val as string[])}
                placeholder="Todos"
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
            <FilterField label="Moneda">
              <Select
                mode="multiple"
                value={filters.currency}
                onChange={(val) =>
                  handleChange("currency", val as CurrencyEnum[])
                }
                placeholder="Todas"
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
            <FilterField label="Categoría">
              <Select
                mode="multiple"
                value={filters.categories}
                onChange={(val) => handleChange("categories", val as string[])}
                placeholder="Todas"
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
    </>
  );
}
