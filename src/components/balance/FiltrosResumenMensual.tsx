import { Col, DatePicker, Row, Select } from "antd";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import type { BalanceFilters } from "../../routes/balance";
import { useCallback, useEffect, useState } from "react";
import { useGroups } from "../../apis/hooks/useGroups";
import { useCurrency } from "../../apis/hooks/useCurrency";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { DollarOutlined, EuroOutlined } from "@ant-design/icons";

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
  const { data: accounts = [] } = useGroups();
  const { data: currencies = [] } = useCurrency();
  const [filters, setFilters] = useState<BalanceFilters>(initialFilters);
  const { RangePicker } = DatePicker;
  const currencyIcon = (currency?: CurrencyEnum) => {
    switch (currency) {
      case CurrencyEnum.ARS:
        return <DollarOutlined />;
      case CurrencyEnum.USD:
        return <DollarOutlined />;
      case CurrencyEnum.EUR:
        return <EuroOutlined />;
      default:
        return <DollarOutlined />;
    }
  };

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleChange = useCallback(
    (
      key: keyof BalanceFilters,
      value: string[] | CurrencyEnum | number[] | Date[],
    ) => setFilters((prev) => ({ ...prev, [key]: value })),
    [],
  );
  return (
    <div style={{ marginBottom: 16, marginTop: 16 }}>
      <Row gutter={16} justify="space-between">
        <Col>
          <Select
            value={filters.currency}
            onChange={(val: CurrencyEnum) =>
              handleChange("currency", val as CurrencyEnum)
            }
            style={{ width: 140 }}
            placeholder="Moneda"
            suffixIcon={currencyIcon(filters.currency)}
          >
            {currencies.map((currency) => (
              <Select.Option
                key={currency.id}
                value={currency.symbol}
                label={currency.symbol}
              >
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {currencyIcon(currency.symbol as CurrencyEnum)}
                  {capitalize(currency.symbol)}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <RangePicker
            size="middle"
            value={
              filters.dates
                ? [dayjs(filters.dates[0]), dayjs(filters.dates[1])]
                : null
            }
            onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
              if (!dates) return;

              const [start, end] = dates;
              if (!start || !end) return;
              const startDateFormated = dayjs(start)
                .hour(12)
                .minute(0)
                .second(0)
                .millisecond(0)
                .toDate();
              const endDateFormated = dayjs(end)
                .hour(12)
                .minute(0)
                .second(0)
                .millisecond(0)
                .toDate();

              handleChange("dates", [startDateFormated, endDateFormated]);
            }}
          />
        </Col>
        <Col>
          <Select
            mode="multiple"
            value={filters.account}
            onChange={(val: number[]) =>
              handleChange("account", val as number[])
            }
            style={{ minWidth: 200 }}
            allowClear
            placeholder="Seleccionar grupo"
          >
            {accounts.map((account) => (
              <Select.Option key={account.id} value={account.id}>
                {capitalize(account.name)}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
}
