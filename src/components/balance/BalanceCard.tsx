import { Card, Col, Flex, Statistic, theme, Typography } from "antd";

const { Text } = Typography;

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  subtitle: string;
  isFetching: boolean;
  iconBg?: string;
  animationDelay?: string;
}

export default function BalanceCard({
  title,
  amount,
  icon,
  subtitle,
  isFetching,
  iconBg,
  animationDelay = "0ms",
}: BalanceCardProps) {
  const { token } = theme.useToken();
  const isPositive = amount >= 0;
  const valueColor = isPositive ? token.colorSuccess : token.colorError;

  return (
    <Col xs={24} sm={12} lg={8}>
      <Card
        loading={isFetching}
        className="fade-in-up"
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
          height: "100%",
          animationDelay,
        }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Flex align="center" gap={14}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: token.borderRadius,
              background:
                iconBg ??
                (isPositive ? token.colorSuccessBg : token.colorErrorBg),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 20,
            }}
          >
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {title}
            </Text>
            <Statistic
              value={Math.abs(amount)}
              prefix={isPositive ? "$" : "-$"}
              precision={2}
              styles={{
                content: {
                  fontSize: 22,
                  fontWeight: 700,
                  color: valueColor,
                  lineHeight: 1.2,
                },
              }}
              style={{ marginBottom: 2 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {subtitle}
            </Text>
          </div>
        </Flex>
      </Card>
    </Col>
  );
}
