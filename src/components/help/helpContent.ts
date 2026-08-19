import type { TFunction } from "i18next";

export interface HelpSection {
  key: string;
  title: string;
  icon: string; // Nombre del icono de Ant Design
  content: HelpParagraph[];
}

export interface HelpParagraph {
  type: "text" | "list" | "tip";
  content: string | string[];
}

// El contenido se genera a partir de las claves i18n `help.sections.*` para poder
// traducirse. Ver src/components/help/HelpPage.tsx para el uso con useTranslation().
export const getHelpSections = (t: TFunction): HelpSection[] => [
  {
    key: "workspace",
    title: t("help.sections.workspace.title"),
    icon: "TeamOutlined",
    content: [
      { type: "text", content: t("help.sections.workspace.text1") },
      {
        type: "list",
        content: t("help.sections.workspace.list1", { returnObjects: true }) as string[],
      },
      { type: "text", content: t("help.sections.workspace.text2") },
      {
        type: "list",
        content: t("help.sections.workspace.list2", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.workspace.tip") },
    ],
  },
  {
    key: "invite",
    title: t("help.sections.invite.title"),
    icon: "UserAddOutlined",
    content: [
      { type: "text", content: t("help.sections.invite.text1") },
      {
        type: "list",
        content: t("help.sections.invite.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.invite.tip") },
    ],
  },
  {
    key: "movements",
    title: t("help.sections.movements.title"),
    icon: "DollarOutlined",
    content: [
      { type: "text", content: t("help.sections.movements.text1") },
      {
        type: "list",
        content: t("help.sections.movements.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.movements.tip") },
    ],
  },
  {
    key: "budgets",
    title: t("help.sections.budgets.title"),
    icon: "FundOutlined",
    content: [
      { type: "text", content: t("help.sections.budgets.text1") },
      {
        type: "list",
        content: t("help.sections.budgets.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.budgets.tip") },
    ],
  },
  {
    key: "income",
    title: t("help.sections.income.title"),
    icon: "WalletOutlined",
    content: [
      { type: "text", content: t("help.sections.income.text1") },
      {
        type: "list",
        content: t("help.sections.income.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.income.tip") },
    ],
  },
  {
    key: "utilities",
    title: t("help.sections.utilities.title"),
    icon: "CalculatorOutlined",
    content: [
      { type: "text", content: t("help.sections.utilities.text1") },
      {
        type: "list",
        content: t("help.sections.utilities.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.utilities.tip") },
    ],
  },
  {
    key: "settings",
    title: t("help.sections.settings.title"),
    icon: "SettingOutlined",
    content: [
      { type: "text", content: t("help.sections.settings.text1") },
      {
        type: "list",
        content: t("help.sections.settings.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.settings.tip") },
    ],
  },
  {
    key: "services",
    title: t("help.sections.services.title"),
    icon: "CalendarOutlined",
    content: [
      { type: "text", content: t("help.sections.services.text1") },
      {
        type: "list",
        content: t("help.sections.services.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.services.tip") },
    ],
  },
  {
    key: "balance",
    title: t("help.sections.balance.title"),
    icon: "PieChartOutlined",
    content: [
      { type: "text", content: t("help.sections.balance.text1") },
      {
        type: "list",
        content: t("help.sections.balance.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.balance.tip") },
    ],
  },
  {
    key: "admin",
    title: t("help.sections.admin.title"),
    icon: "SafetyOutlined",
    content: [
      { type: "text", content: t("help.sections.admin.text1") },
      {
        type: "list",
        content: t("help.sections.admin.list1", { returnObjects: true }) as string[],
      },
      { type: "tip", content: t("help.sections.admin.tip") },
    ],
  },
];
