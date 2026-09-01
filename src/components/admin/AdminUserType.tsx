import { Alert, Card, Flex, Segmented, Typography, message, theme } from "antd";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { useChangeUserType } from "@/apis/hooks/useUserType";
import { UserTypeEnum } from "@/enums/UserTypeEnum";

const { Title, Text } = Typography;

/**
 * Componente para que usuarios ADMIN puedan cambiar su tipo de usuario
 * entre PERSONAL y ENTERPRISE.
 *
 * Llama al endpoint PATCH /v1/users/me/type
 */
export default function AdminUserType() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const changeUserTypeMutation = useChangeUserType();

  const handleChange = (value: string | number) => {
    const newType = value as UserTypeEnum;

    // Si es el mismo tipo, no hacer nada
    if (newType === currentUser?.userType) {
      return;
    }

    changeUserTypeMutation.mutate(
      { userType: newType },
      {
        onSuccess: () => {
          message.success(t("admin.userType.changeSuccess", { type: newType }));
        },
        onError: (error) => {
          if (error instanceof Error) {
            // @ts-expect-error - response puede estar presente en el error de Axios
            const status = error.response?.status;
            if (status === 403) {
              message.error(t("admin.userType.errorForbidden"));
            } else if (status === 400) {
              message.error(t("admin.userType.errorInvalid"));
            } else {
              message.error(t("admin.userType.errorGeneric"));
            }
          } else {
            message.error(t("admin.userType.errorUnexpected"));
          }
        },
      },
    );
  };

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex align="center" gap={10} style={{ marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: token.borderRadius,
              background: token.colorPrimaryBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
              {t("admin.userType.title")}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("admin.userType.subtitle")}
            </Text>
          </div>
        </Flex>

        <Alert
          type="info"
          showIcon
          title={t("admin.userType.alertMessage")}
          description={
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
              <li>
                <strong>{t("admin.userType.personalLabel")}:</strong> {t("admin.userType.personalDescription")}
              </li>
              <li>
                <strong>{t("admin.userType.enterpriseLabel")}:</strong> {t("admin.userType.enterpriseDescription")}
              </li>
            </ul>
          }
          style={{ marginBottom: 16 }}
        />

        <Flex vertical gap={8}>
          <Text strong>{t("admin.userType.currentTypeLabel")}</Text>
          <Segmented
            value={currentUser?.userType ?? UserTypeEnum.PERSONAL}
            onChange={handleChange}
            disabled={changeUserTypeMutation.isPending}
            block
            size="large"
            options={[
              {
                label: t("admin.userType.personalLabel"),
                value: UserTypeEnum.PERSONAL,
                icon: <UserOutlined />,
              },
              {
                label: t("admin.userType.enterpriseLabel"),
                value: UserTypeEnum.ENTERPRISE,
                icon: <UserOutlined />,
              },
            ]}
          />
        </Flex>
      </Card>
    </Flex>
  );
}
