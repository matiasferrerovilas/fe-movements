import { Card, Col, Row, Select } from "antd";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import type { BalanceFilters } from "../../routes/balance";
import { useCallback, useEffect, useState } from "react";
import { useGroups } from "../../apis/hooks/useGroups";

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

interface Props {
  initialFilters: BalanceFilters;
  onFiltersChange: (filters: BalanceFilters) => void;
}
export default function FiltrosResumenMensual({
  initialFilters,
  onFiltersChange,
}: Props) {
  const { data: userGroups = [] } = useGroups();

  const [filters, setFilters] = useState<BalanceFilters>(initialFilters);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleChange = useCallback(
    (key: keyof BalanceFilters, value: string[] | CurrencyEnum | number[]) =>
      setFilters((prev) => ({ ...prev, [key]: value })),
    []
  );
  return (
    <Card title="Filtros" style={{ marginBottom: 16, marginTop: 16 }}>
      <Row gutter={16} justify="space-between">
        <Col>
          <Select
            value={filters.currency}
            onChange={(val: CurrencyEnum) =>
              handleChange("currency", val as CurrencyEnum)
            }
            style={{ width: 200 }}
            placeholder="Todas las Monedas"
            allowClear
          >
            {Object.values(CurrencyEnum).map((currency) => (
              <Select.Option key={currency} value={currency}>
                {capitalize(currency)}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            mode="multiple"
            value={filters.groups}
            onChange={(val: number[]) =>
              handleChange("groups", val as number[])
            }
            style={{ minWidth: 200 }}
            allowClear
            placeholder="Seleccionar grupo"
          >
            {userGroups.map((group) => (
              <Select.Option key={group.id} value={group.id}>
                {capitalize(group.name)}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Card>
  );
}
