import { Card, Col, Flex, Row, Statistic, theme, Typography } from "antd";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { Service } from "../../models/Service";

const { Text } = Typography;

interface ServiceSummaryProps {
  services: Service[];
  isFetching: boolean;
}

export function ServiceSummary({ services, isFetching }: ServiceSummaryProps) {
  const { token } = theme.useToken();

  const unpaidServices = services?.filter((s) => !s.isPaid) ?? [];
  const paidServices = services?.filter((s) => s.isPaid) ?? [];
  const totalPaid = paidServices.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalUnpaid = unpaidServices.reduce(
    (acc, s) => acc + (s.amount || 0),
    0,
  );

  const stats = [
    {
      key: "total",
      icon: (
        <AppstoreOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
      ),
      iconBg: token.colorPrimaryBg,
      title: "Total Servicios",
      value: services?.length ?? 0,
      prefix: undefined,
      suffix: undefined,
      sub: "Servicios registrados",
      valueColor: token.colorPrimary,
    },
    {
      key: "paid",
      icon: (
        <CheckCircleOutlined
          style={{ fontSize: 20, color: token.colorSuccess }}
        />
      ),
      iconBg: token.colorSuccessBg,
      title: "Pagados",
      value: totalPaid,
      prefix: "$",
      suffix: undefined,
      sub: `${paidServices.length} servicios al día`,
      valueColor: token.colorSuccess,
    },
    {
      key: "unpaid",
      icon: (
        <ClockCircleOutlined
          style={{ fontSize: 20, color: token.colorWarning }}
        />
      ),
      iconBg: token.colorWarningBg,
      title: "Pendientes",
      value: totalUnpaid,
      prefix: "$",
      suffix: undefined,
      sub: `${unpaidServices.length} servicios pendientes`,
      valueColor: token.colorWarning,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {stats.map((stat) => (
        <Col key={stat.key} xs={24} sm={8}>
          <Card
            loading={isFetching}
            style={{
              borderRadius: token.borderRadiusLG,
              borderColor: token.colorBorder,
            }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Flex align="center" gap={14}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: token.borderRadius,
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  {stat.title}
                </Text>
                <Statistic
                  value={stat.value}
                  prefix={stat.prefix}
                  precision={stat.prefix ? 2 : 0}
                  styles={{
                    content: {
                      fontSize: 22,
                      fontWeight: 700,
                      color: stat.valueColor,
                      lineHeight: 1.2,
                    },
                  }}
                  style={{ marginBottom: 2 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {stat.sub}
                </Text>
              </div>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
