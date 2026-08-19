import PlusOutlined from "@ant-design/icons/PlusOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { OnboardingForm } from "@/apis/onboarding/OnboardingApi";
import { getEntityLabels } from "@/utils/entityLabels";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: Pick<OnboardingForm, "accountsToAdd">) => void;
  onPrev: () => void;
}

interface WorkspaceEntry {
  name: string;
  isDefault: boolean;
}

export default function WorkspaceOnboarding({ initialValues, onNext, onPrev }: Props) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [form] = Form.useForm<{ name: string }>();
  const labels = getEntityLabels(initialValues.userType ?? null, t);
  const [workspaces, setWorkspaces] = useState<WorkspaceEntry[]>(
    (initialValues.accountsToAdd ?? []).map((name, i) => ({
      name,
      isDefault: i === 0,
    })),
  );

  const handleAdd = () => {
    form.validateFields().then(({ name }) => {
      const trimmed = name.trim();
      if (!trimmed || workspaces.some((w) => w.name === trimmed)) return;
      // El primero que se agrega es default automáticamente
      setWorkspaces((prev) => [
        ...prev,
        { name: trimmed, isDefault: prev.length === 0 },
      ]);
      form.resetFields();
    }).catch(() => {});
  };

  const handleRemove = (name: string) => {
    setWorkspaces((prev) => {
      const filtered = prev.filter((w) => w.name !== name);
      // Si borramos el default y quedan workspaces, el primero pasa a ser default
      const hadDefault = prev.find((w) => w.name === name)?.isDefault;
      if (hadDefault && filtered.length > 0) {
        return filtered.map((w, i) => ({ ...w, isDefault: i === 0 }));
      }
      return filtered;
    });
  };

  const handleSetDefault = (name: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({ ...w, isDefault: w.name === name })),
    );
  };

  const handleSubmit = () => {
    // El default (si hay uno) queda primero — es el que se usa como workspace por defecto
    const ordered = [...workspaces].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    onNext({ accountsToAdd: ordered.map((w) => w.name) });
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {labels.workspaceQuestion}
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          {labels.workspaceDescription}
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          {labels.workspaceDefault}
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Row gutter={[12, 0]} align="middle">
          <Col flex="auto">
            <Form.Item
              name="name"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: labels.workspaceNameRequired },
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) return Promise.resolve();
                    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
                      return Promise.reject(
                        new Error(t("onboarding.workspace.nameLettersOnly")),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder={labels.workspacePlaceholder}
                style={{ borderRadius: 10, height: 40 }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              htmlType="submit"
              style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
            >
              {labels.workspaceCrear}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Lista de workspaces agregados */}
      <div
        style={{
          minHeight: 80,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        {workspaces.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("onboarding.workspace.emptyDescription", {
                  workspace: labels.workspaceSingular,
                })}
              </Text>
            }
            style={{ margin: "8px 0" }}
          />
        ) : (
          <Flex vertical gap={8}>
            {workspaces.map((workspace) => (
              <div
                key={workspace.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${workspace.isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                  background: workspace.isDefault ? token.colorPrimaryBg : token.colorBgContainer,
                  transition: "all 0.2s ease",
                }}
              >
                <Flex align="center" gap={10}>
                  <AppstoreOutlined
                    style={{
                      color: workspace.isDefault ? token.colorPrimary : token.colorTextSecondary,
                      fontSize: 16,
                    }}
                  />
                  <Text strong style={{ fontSize: 14 }}>
                    {workspace.name}
                  </Text>
                  {workspace.isDefault && (
                    <span
                      style={{
                        background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                        borderRadius: 20,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        padding: "2px 9px",
                        textTransform: "uppercase",
                        lineHeight: "18px",
                      }}
                    >
                      ★ Default
                    </span>
                  )}
                </Flex>
                <Flex gap={4}>
                  <Tooltip
                    title={
                      workspace.isDefault
                        ? t("onboarding.workspace.starTooltipDefault", {
                            workspace: labels.workspaceSingular,
                          })
                        : t("onboarding.workspace.starTooltipSetDefault")
                    }
                  >
                    <Button
                      type="text"
                      size="small"
                      aria-label={t("onboarding.workspace.starAriaLabel", {
                        workspace: labels.workspaceSingular,
                        name: workspace.name,
                      })}
                      disabled={workspace.isDefault}
                      onClick={() => handleSetDefault(workspace.name)}
                      icon={
                        workspace.isDefault
                          ? <StarFilled style={{ color: token.colorWarning }} />
                          : <StarOutlined style={{ color: token.colorTextQuaternary }} />
                      }
                    />
                  </Tooltip>
                  <Tooltip
                    title={t("onboarding.workspace.deleteTooltip", {
                      workspace: labels.workspaceSingular,
                    })}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      aria-label={t("onboarding.workspace.deleteAriaLabel", {
                        workspace: labels.workspaceSingular,
                        name: workspace.name,
                      })}
                      onClick={() => handleRemove(workspace.name)}
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Flex>
              </div>
            ))}
          </Flex>
        )}
      </div>

      <Text type="secondary" style={{ fontSize: 12, display: "block", textAlign: "center" }}>
        {labels.workspacesLowerCreateHint}
      </Text>

      <Row gutter={[16, 10]}>
        <Col xs={12}>
          <Button block type="default" onClick={onPrev}>
            {t("onboarding.backButton")}
          </Button>
        </Col>
        <Col xs={12}>
          <Button color="geekblue" block onClick={handleSubmit} variant="filled">
            {t("onboarding.nextButton")}
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
