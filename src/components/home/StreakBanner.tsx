import FireOutlined from "@ant-design/icons/FireOutlined";
import { Skeleton, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import { useStreak } from "@/apis/hooks/useGamification";

const { Text } = Typography;

export default function StreakBanner() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { data, isFetching } = useStreak();

  if (isFetching && !data) {
    return (
      <Skeleton.Input
        active
        size="small"
        style={{ width: 260, height: 32, marginBottom: 24 }}
      />
    );
  }

  if (!data) {
    return null;
  }

  const { currentStreak, longestStreak } = data;
  const isActive = currentStreak > 0;

  return (
    <div
      className="fade-in-up"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        marginBottom: 24,
        borderRadius: token.borderRadiusLG,
        background: isActive ? token.colorWarningBg : token.colorFillTertiary,
        border: `1px solid ${isActive ? token.colorWarningBorder : token.colorBorderSecondary}`,
      }}
    >
      <FireOutlined
        style={{
          color: isActive ? token.colorWarning : token.colorTextQuaternary,
          fontSize: 15,
        }}
      />
      <Text style={{ fontSize: 13 }}>
        {isActive
          ? t("home.streak.active", { count: currentStreak })
          : longestStreak > 0
            ? t("home.streak.brokenWithRecord", { count: longestStreak })
            : t("home.streak.startNudge")}
      </Text>
      {isActive && longestStreak > currentStreak && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          · {t("home.streak.record", { count: longestStreak })}
        </Text>
      )}
    </div>
  );
}
