import { Alert, Card, Flex, Segmented, Typography, message, theme } from "antd";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useCurrentUser } from "../../apis/hooks/useCurrentUser";
import { useChangeUserType } from "../../apis/hooks/useUserType";
import { UserTypeEnum } from "../../enums/UserTypeEnum";

const { Title, Text } = Typography;

/**
 * Componente para que usuarios ADMIN puedan cambiar su tipo de usuario
 * entre PERSONAL y ENTERPRISE.
 *
 * Llama al endpoint PATCH /v1/users/me/type
 */
export default function AdminUserType() {
  const { token } = theme.useToken();
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
          message.success(`Tipo de usuario cambiado a ${newType}`);
        },
        onError: (error) => {
          if (error instanceof Error) {
            // @ts-expect-error - response puede estar presente en el error de Axios
            const status = error.response?.status;
            if (status === 403) {
              message.error("No tenés permisos para cambiar el tipo de usuario");
            } else if (status === 400) {
              message.error("Tipo de usuario inválido");
            } else {
              message.error("Error al cambiar el tipo de usuario");
            }
          } else {
            message.error("Error inesperado al cambiar el tipo de usuario");
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
              Tipo de Usuario
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Cambiá el tipo de uso de tu cuenta
            </Text>
          </div>
        </Flex>

        <Alert
          type="info"
          showIcon
          message="Seleccioná el tipo de uso que mejor se adapte a tus necesidades"
          description={
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
              <li>
                <strong>Personal:</strong> Para uso personal (familia, sueldo, gastos personales)
              </li>
              <li>
                <strong>Enterprise:</strong> Para uso empresarial (proyectos, ingresos, gastos del negocio)
              </li>
            </ul>
          }
          style={{ marginBottom: 16 }}
        />

        <Flex vertical gap={8}>
          <Text strong>Tipo actual:</Text>
          <Segmented
            value={currentUser?.userType ?? UserTypeEnum.PERSONAL}
            onChange={handleChange}
            disabled={changeUserTypeMutation.isPending}
            block
            size="large"
            options={[
              {
                label: "Personal",
                value: UserTypeEnum.PERSONAL,
                icon: <UserOutlined />,
              },
              {
                label: "Enterprise",
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
