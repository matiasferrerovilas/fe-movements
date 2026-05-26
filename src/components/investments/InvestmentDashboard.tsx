import { useMemo } from "react";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import type { Investment } from "../../models/Investment";

interface InvestmentDashboardProps {
  investments: Investment[];
  isFetching: boolean;
}

export function InvestmentDashboard({
  investments,
  isFetching,
}: InvestmentDashboardProps) {
  const totalInvertido = useMemo(
    () => investments.reduce((sum, inv) => sum + inv.montoInvertido, 0),
    [investments],
  );

  const valorActual = useMemo(
    () => investments.reduce((sum, inv) => sum + inv.valorActual, 0),
    [investments],
  );

  const ganancia = valorActual - totalInvertido;
  const rendimiento =
    totalInvertido > 0 ? (ganancia / totalInvertido) * 100 : 0;
  const isPositive = ganancia >= 0;

  if (isFetching) {
    return (
      <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="total-invertido">
            <Statisticcrea
              en
              title="Total invertido"
              value={totalInvertido}
              precision={2}
            />
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="valor-actual">
            <Statistic title="Valor actual" value={valorActual} precision={2} />
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="ganancia">
            <Statistic
              title="Ganancia / Pérdida"
              value={Math.abs(ganancia)}
              precision={2}
              valueStyle={{ color: isPositive ? "#3f8600" : "#cf1322" }}
              prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={12} md={6}>
        <Card size="small">
          <div data-testid="rendimiento">
            <Statistic
              title="Rendimiento"
              value={Math.abs(rendimiento)}
              precision={2}
              suffix="%"
              valueStyle={{ color: isPositive ? "#3f8600" : "#cf1322" }}
              prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
