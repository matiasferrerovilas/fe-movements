import GiftOutlined from "@ant-design/icons/GiftOutlined";
import { Card, Flex, theme, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useTranslation } from "react-i18next";
import { useBadges } from "@/apis/hooks/useGamification";
import type { BadgeRecord } from "@/models/Gamification";

const { Text, Title } = Typography;

function BadgeRow({ badge }: { badge: BadgeRecord }) {
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();
  const monthLabel = dayjs(`${badge.year}-${badge.month}-01`)
    .locale(i18n.resolvedLanguage === "en" ? "en" : "es")
    .format("MMMM YYYY");

  return (
    <li style={{ padding: "10px 0" }}>
      <Flex align="center" gap={10} style={{ width: "100%" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: token.colorWarningBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <GiftOutlined style={{ color: token.colorWarning, fontSize: 14 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 13 }}>
            {t("home.badges.budgetMet", { category: badge.categoryDescription })}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11, textTransform: "capitalize" }}>
            {monthLabel}
          </Text>
        </div>
      </Flex>
    </li>
  );
}

export default function BadgesPanel() {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const { data: badges = [], isFetching } = useBadges();
  const isVisible = isFetching || badges.length > 0;

  if (!isVisible) {
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
        <GiftOutlined style={{ color: token.colorWarning, fontSize: 16 }} />
        <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          {t("home.badges.title")}
        </Title>
      </Flex>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {t("home.badges.subtitle")}
      </Text>
      <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
        {badges.map((badge) => (
          <BadgeRow key={badge.id} badge={badge} />
        ))}
      </ul>
    </Card>
  );
}
