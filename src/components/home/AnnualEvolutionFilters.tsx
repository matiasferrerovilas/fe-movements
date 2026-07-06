import { Checkbox, Collapse, Flex } from "antd";
import FilterOutlined from "@ant-design/icons/FilterOutlined";

type Props = {
  currencies: string[];
  selected: string[];
  onChange: (v: string[]) => void;
};

export default function AnnualEvolutionFilters({
  currencies,
  selected,
  onChange,
}: Props) {
  return (
    <Collapse
      style={{ marginBottom: 16 }}
      items={[
        {
          key: "filters",
          label: (
            <Flex align="center" gap={8}>
              <FilterOutlined />
              <span>Filtrar monedas</span>
            </Flex>
          ),
          children: (
            <Checkbox.Group
              value={selected}
              onChange={(vals) => onChange(vals as string[])}
              options={currencies.map((c) => ({ label: c, value: c }))}
            />
          ),
        },
      ]}
    />
  );
}
