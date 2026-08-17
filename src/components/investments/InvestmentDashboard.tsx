import { useMemo } from "react";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import { useTranslation } from "react-i18next";
import type { Investment } from "@/models/Investment";

interface InvestmentDashboardProps {
  investments: Investment[];
  isFetching: boolean;
}

export function InvestmentDashboard({
  investments,
  isFetching,
}: InvestmentDashboardProps) {
  const { t } = useTranslation();
  const totalInvertido = useMemo(
    () => investments.reduce((sum, inv) => sum + inv.amount, 0),
    [investments],
  );

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
            <Statistic
              title={t("investments.totalInvested")}
              value={totalInvertido}
              precision={2}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
