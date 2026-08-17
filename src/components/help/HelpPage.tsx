import CalculatorOutlined from "@ant-design/icons/CalculatorOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import FundOutlined from "@ant-design/icons/FundOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import PieChartOutlined from "@ant-design/icons/PieChartOutlined";
import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import SafetyOutlined from "@ant-design/icons/SafetyOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import WalletOutlined from "@ant-design/icons/WalletOutlined";
import { Col, Collapse, Flex, Row, theme, Typography } from "antd";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getHelpSections, type HelpParagraph, type HelpSection } from "@/components/help/helpContent";

const { Title, Text, Paragraph } = Typography;

// Mapa de iconos por key
const ICON_MAP: Record<string, React.ReactNode> = {
  TeamOutlined: <TeamOutlined />,
  UserAddOutlined: <UserAddOutlined />,
  DollarOutlined: <DollarOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  FundOutlined: <FundOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  WalletOutlined: <WalletOutlined />,
  CalculatorOutlined: <CalculatorOutlined />,
  SettingOutlined: <SettingOutlined />,
  SafetyOutlined: <SafetyOutlined />,
};

function HelpParagraphRenderer({ paragraph }: { paragraph: HelpParagraph }) {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  if (paragraph.type === "text") {
    return (
      <Paragraph style={{ marginBottom: 16, color: token.colorText }}>
        {paragraph.content as string}
      </Paragraph>
    );
  }

  if (paragraph.type === "list") {
    return (
      <ul
        style={{
          marginBottom: 16,
          paddingLeft: 20,
          color: token.colorText,
        }}
      >
        {(paragraph.content as string[]).map((item, idx) => (
          <li key={idx} style={{ marginBottom: 6 }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (paragraph.type === "tip") {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: token.colorPrimaryBg,
          borderLeft: `3px solid ${token.colorPrimary}`,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: token.colorPrimary, fontWeight: 500 }}>
          {t("help.tipLabel")}{" "}
        </Text>
        <Text style={{ color: token.colorText }}>{paragraph.content as string}</Text>
      </div>
    );
  }

  return null;
}

function HelpSectionContent({ section }: { section: HelpSection }) {
  return (
    <div>
      {section.content.map((paragraph, idx) => (
        <HelpParagraphRenderer key={idx} paragraph={paragraph} />
      ))}
    </div>
  );
}

export function HelpPage() {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const helpSections = useMemo(() => getHelpSections(t), [t]);

  const collapseItems = useMemo(
    () =>
      helpSections.map((section) => ({
        key: section.key,
        label: (
          <Flex align="center" gap={10}>
            <span
              style={{
                fontSize: 18,
                color: token.colorPrimary,
                display: "flex",
                alignItems: "center",
              }}
            >
              {ICON_MAP[section.icon] ?? <QuestionCircleOutlined />}
            </span>
            <Text strong style={{ fontSize: 15 }}>
              {section.title}
            </Text>
          </Flex>
        ),
        children: <HelpSectionContent section={section} />,
      })),
    [helpSections, token.colorPrimary],
  );

  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col
        xs={24}
        sm={22}
        md={18}
        lg={14}
        xl={12}
        className="fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        {/* Header */}
        <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${token.colorPrimaryBorder}`,
            }}
          >
            <QuestionCircleOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {t("help.title")}
            </Title>
            <Text type="secondary">
              {t("help.subtitle")}
            </Text>
          </div>
        </Flex>

        {/* Collapsible sections */}
        <Collapse
          accordion
          defaultActiveKey={["workspace"]}
          expandIconPosition="end"
          style={{
            background: token.colorBgContainer,
            borderRadius: 12,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
          items={collapseItems}
        />

        {/* Footer note */}
        <Flex
          justify="center"
          style={{
            marginTop: 32,
            paddingBottom: 32,
          }}
        >
          <Text type="secondary" style={{ fontSize: 13 }}>
            {t("help.footerNote")}
          </Text>
        </Flex>
      </Col>
    </Row>
  );
}
