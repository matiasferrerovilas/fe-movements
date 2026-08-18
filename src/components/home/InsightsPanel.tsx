import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import BulbOutlined from "@ant-design/icons/BulbOutlined";
import { Card, Flex, List, Tag, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useInsights } from "@/apis/hooks/useInsights";
import { useUserDefault } from "@/apis/hooks/useSettings";
import type { CategoryInsight } from "@/models/Insight";

const { Text, Title } = Typography;

function formatAmount(amount: number): string {
  return amount.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function InsightRow({ insight }: { insight: CategoryInsight }) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const isAbove = insight.direction === "ABOVE";
  const color = isAbove ? token.colorError : token.colorSuccess;
  const Icon = isAbove ? ArrowUpOutlined : ArrowDownOutlined;

  return (
    <List.Item style={{ padding: "10px 0", border: "none" }}>
      <Flex align="center" gap={10} style={{ width: "100%" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: isAbove ? token.colorErrorBg : token.colorSuccessBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ color, fontSize: 14 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 13 }}>
            {t(isAbove ? "home.insights.aboveMessage" : "home.insights.belowMessage", {
              category: insight.category,
              percent: insight.percentDeviation.toFixed(0),
            })}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {t("home.insights.detail", {
              current: `${insight.currency} ${formatAmount(insight.currentAmount)}`,
              average: `${insight.currency} ${formatAmount(insight.averageAmount)}`,
            })}
          </Text>
        </div>
        <Tag color={isAbove ? "error" : "success"} style={{ margin: 0, flexShrink: 0 }}>
          {isAbove ? "+" : "-"}
          {insight.percentDeviation.toFixed(0)}%
        </Tag>
      </Flex>
    </List.Item>
  );
}

export default function InsightsPanel() {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const { data: defaultWorkspace } = useUserDefault("DEFAULT_WORKSPACE");
  const workspaceId = defaultWorkspace?.value ?? null;

  const { data: insights = [], isFetching } = useInsights(workspaceId);

  if (!isFetching && insights.length === 0) {
    return null;
  }

  return (
    <Card
      className="fade-in-up"
      loading={isFetching}
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorder,
        marginBottom: 24,
      }}
    >
      <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
        <BulbOutlined style={{ color: token.colorWarning, fontSize: 16 }} />
        <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          {t("home.insights.title")}
        </Title>
      </Flex>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {t("home.insights.subtitle")}
      </Text>
      <List
        dataSource={insights}
        renderItem={(insight) => (
          <InsightRow key={`${insight.currency}-${insight.category}`} insight={insight} />
        )}
        split
        style={{ marginTop: 8 }}
      />
    </Card>
  );
}
