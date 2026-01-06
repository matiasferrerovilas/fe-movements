import { Card, Col, Input, Row, Segmented, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MovementFilters } from "../../routes/movement";
import { BankEnum } from "../../enums/BankEnum";
import { TypeEnum } from "../../enums/TypeExpense";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import { useCategory } from "../../apis/hooks/useCategory";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import RiseOutlined from "@ant-design/icons/RiseOutlined";
import { useCurrency } from "../../apis/hooks/useCurrency";

const { Option } = Select;

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

interface Props {
  onFiltersChange: (filters: MovementFilters) => void;
  initialFilters: MovementFilters;
  AddEditMovementModal: React.ComponentType;
}

export default function FiltrosMovement({
  onFiltersChange,
  initialFilters,
  AddEditMovementModal,
}: Props) {
  const { data: categories = [] } = useCategory();
  const [filters, setFilters] = useState<MovementFilters>(initialFilters);
  const {data: currencies = []} = useCurrency();

  const handleChange = useCallback(
    (
      key: keyof MovementFilters,
      value: string | boolean | null | BankEnum[] | TypeEnum[] | string[]
    ) => setFilters((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleLiveChange = useCallback(
    (value: boolean) => setFilters((prev) => ({ ...prev, isLive: value })),
    []
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
    []
  );
  const Modal = useMemo(() => <AddEditMovementModal />, [AddEditMovementModal]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          gap: 16,
        }}
      >
        <Segmented
          options={segmentedOptions}
          value={filters.isLive}
          onChange={handleLiveChange}
          size="large"
          shape="round"
        />
        {Modal}
      </div>

      <Card title="Filtros" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle" justify="center">
          <Col>
            <Input
              placeholder="Buscar..."
              value={filters.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              style={{ width: 200 }}
            />
          </Col>

          <Col>
            <Select
              mode="multiple"
              value={filters.type}
              onChange={(val) => handleChange("type", val as TypeEnum[])}
              style={{ width: 200 }}
              placeholder="Todos los Tipos"
              allowClear
            >
              {Object.values(TypeEnum).map((type) => (
                <Option key={type} value={type}>
                  {capitalize(type)}
                </Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Select
              mode="multiple"
              value={filters.bank}
              onChange={(val) => handleChange("bank", val as BankEnum[])}
              style={{ width: 200 }}
              placeholder="Todos los Bancos"
              allowClear
            >
              {Object.values(BankEnum).map((bank) => (
                <Option key={bank} value={bank}>
                  {capitalize(bank)}
                </Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Select
              mode="multiple"
              value={filters.currency}
              onChange={(val) =>
                handleChange("currency", val as CurrencyEnum[])
              }
              style={{ width: 200 }}
              placeholder="Todas las Monedas"
              allowClear
            >
              {currencies.map((currency) => (
                <Option key={currency.id} value={currency.symbol}>
                  {capitalize(currency.symbol)}
                </Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Select
              mode="multiple"
              value={filters.categories}
              onChange={(val) => handleChange("categories", val as string[])}
              style={{ width: 200 }}
              placeholder="Todas las Categorías"
              allowClear
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.description}>
                  {cat.description}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>
    </>
  );
}
