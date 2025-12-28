import { createFileRoute } from "@tanstack/react-router";
import ResumenMensual from "../components/balance/ResumenMensual";
import BalanceGrafico from "../components/balance/BalanceGrafico";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { Col, Row, Space, Typography } from "antd";
import { CurrencyEnum } from "../enums/CurrencyEnum";
import { useCallback, useRef, useState } from "react";
import FiltrosResumenMensual from "../components/balance/FiltrosResumenMensual";
import BalanceGrupoGastado from "../components/balance/BalanceGrupoGastado";
import { RoleEnum } from "../enums/RoleEnum";
const { Title, Text } = Typography;

export const Route = createFileRoute("/balance")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});
export type BalanceFilters = {
  account: number[] | null;
  currency: CurrencyEnum;
  year?: number;
  month?: number;
};

function RouteComponent() {
  const [filters, setFilters] = useState<BalanceFilters>({
    currency: CurrencyEnum.ARS,
    account: [1],
  });
  const filtersRef = useRef(filters);

  const handleFiltersChange = useCallback((newFilters: BalanceFilters) => {
    filtersRef.current = newFilters;
    setFilters(newFilters);
  }, []);

  return (
    <div style={{ paddingTop: 30 }}>
      <Row>
        <Col xs={24} sm={12} lg={8}>
          <Space orientation="vertical" size={1}>
            <Title level={2} style={{ margin: 0 }}>
              Balance Financiero
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Vista detallada de ingresos y gastos del mes actual
            </Text>
          </Space>
        </Col>
      </Row>
      <FiltrosResumenMensual
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
      />
      <ResumenMensual filters={filters} />

      <Row gutter={16} justify="center">
        <BalanceGrafico
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        <BalanceGrupoGastado />
      </Row>
    </div>
  );
}
