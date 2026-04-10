import { Col, Flex, Row, Select, Typography } from "antd";
import { useGroups } from "../../apis/hooks/useGroups";
import { useCurrency } from "../../apis/hooks/useCurrency";

const { Text } = Typography;

export interface BudgetFilterValues {
  accountId: number | null;
  currency: string | null;
}

interface Props {
  filters: BudgetFilterValues;
  onFiltersChange: (filters: BudgetFilterValues) => void;
}

export function BudgetFilters({ filters, onFiltersChange }: Props) {
  const { data: memberships = [] } = useGroups();
  const { data: currencies = [] } = useCurrency();

  return (
    <Row gutter={[16, 12]} align="bottom">
      <Col xs={24} sm={12} md={8}>
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Grupo / Cuenta
          </Text>
          <Select
            value={filters.accountId}
            onChange={(val: number) =>
              onFiltersChange({ ...filters, accountId: val })
            }
            placeholder="Seleccioná un grupo"
            style={{ width: "100%" }}
            options={memberships.map((m) => ({
              label: m.groupDescription,
              value: m.accountId,
            }))}
          />
        </Flex>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Moneda
          </Text>
          <Select
            value={filters.currency}
            onChange={(val: string) =>
              onFiltersChange({ ...filters, currency: val })
            }
            placeholder="Seleccioná una moneda"
            style={{ width: "100%" }}
            options={currencies.map((c) => ({
              label: c.symbol,
              value: c.symbol,
            }))}
          />
        </Flex>
      </Col>
    </Row>
  );
}
