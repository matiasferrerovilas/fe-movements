import { Card, Col, Flex, Row, Select, Typography } from "antd";
import { DatePicker } from "antd";
import { DollarOutlined, EuroOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import type { BalanceFilters as BalanceFiltersType } from "../../routes/balance";
import type { Membership } from "../../models/UserWorkspace";
import type { Currency } from "../../models/Currency";
import { capitalize } from "./constants";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const currencyIcon = (currency?: CurrencyEnum) =>
  currency === CurrencyEnum.EUR ? <EuroOutlined /> : <DollarOutlined />;

type BalanceFiltersProps = {
  filters: BalanceFiltersType;
  memberships: Membership[];
  currencies: Currency[];
  onFilterChange: <K extends keyof BalanceFiltersType>(
    key: K,
    value: BalanceFiltersType[K],
  ) => void;
};

export default function BalanceFilters({
  filters,
  memberships,
  currencies,
  onFilterChange,
}: BalanceFiltersProps) {
  const rangePickerValue = useMemo(
    () =>
      filters.dates
        ? ([dayjs(filters.dates[0]), dayjs(filters.dates[1])] as [Dayjs, Dayjs])
        : null,
    [filters.dates],
  );

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates?.[0] || !dates?.[1]) return;
    onFilterChange("dates", [
      dates[0].hour(12).minute(0).second(0).millisecond(0).toDate(),
      dates[1].hour(12).minute(0).second(0).millisecond(0).toDate(),
    ]);
  };

  return (
    <Card
      className="fade-in-up"
      style={{ marginBottom: 24, animationDelay: "60ms" }}
    >
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} sm={12} md={6}>
          <Flex vertical gap={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Moneda
            </Text>
            <Select
              value={filters.currency}
              onChange={(val: CurrencyEnum) => onFilterChange("currency", val)}
              style={{ width: "100%" }}
              suffixIcon={currencyIcon(filters.currency)}
              options={currencies.map((c) => ({
                value: c.symbol,
                label: (
                  <Flex gap={6} align="center">
                    {currencyIcon(c.symbol as CurrencyEnum)}
                    {capitalize(c.symbol)}
                  </Flex>
                ),
              }))}
            />
          </Flex>
        </Col>

        <Col xs={24} sm={12} md={10}>
          <Flex vertical gap={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Período
            </Text>
            <RangePicker
              style={{ width: "100%" }}
              value={rangePickerValue}
              onChange={handleRangeChange}
            />
          </Flex>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Flex vertical gap={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Grupos
            </Text>
            <Select
              mode="multiple"
              value={filters.account ?? []}
              onChange={(val: number[]) => onFilterChange("account", val)}
              style={{ width: "100%" }}
              allowClear
              placeholder="Todos los grupos"
              options={memberships.map((m) => ({
                label: m.workspaceName,
                value: m.workspaceId,
                key: m.workspaceId,
              }))}
            />
          </Flex>
        </Col>
      </Row>
    </Card>
  );
}
