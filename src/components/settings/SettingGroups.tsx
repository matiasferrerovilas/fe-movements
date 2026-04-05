import { Button, Card, Col, Divider, Flex, Form, Input, Row, theme, Typography } from "antd";
import { useAllGroupsWithUsers } from "../../apis/hooks/useGroups";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import SettingGroupCard from "./SettingGroupCard";
import type {
  CreateGroupForm,
  GroupDetail,
} from "../../models/UserGroup";
import { useMutation } from "@tanstack/react-query";
import { useGroupsSubscription } from "../../apis/websocket/useGroupsSubscription";
import { addGroupApi, setDefaultGroupApi } from "../../apis/GroupApi";

const { Title, Text } = Typography;

export function SettingGroups() {
  const { data: groups = [], isLoading } = useAllGroupsWithUsers();
  const [form] = Form.useForm<CreateGroupForm>();
  const { token } = theme.useToken();

  useGroupsSubscription();

  const addGroupMutation = useMutation({
    mutationFn: ({ group }: { group: CreateGroupForm }) => addGroupApi(group),
    onError: (err) => console.error("Error creando grupo:", err),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => setDefaultGroupApi(id),
    onError: (err) => console.error("Error cambiando grupo default:", err),
  });

  const onFinish = (values: CreateGroupForm) => {
    addGroupMutation.mutate({ group: values });
    form.resetFields();
  };

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      {/* Header */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Gestionar Grupos
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Crea y administra grupos para organizar tus gastos.
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Crear grupo */}
      <Card
        styles={{ body: { padding: "14px 16px" } }}
        style={{
          borderRadius: 14,
          border: `1.5px dashed ${token.colorPrimaryBorder}`,
          background: token.colorPrimaryBg,
          marginBottom: 20,
        }}
      >
        <Text
          strong
          style={{
            fontSize: 13,
            color: token.colorText,
            display: "block",
            marginBottom: 10,
          }}
        >
          Nuevo Grupo
        </Text>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[12, 0]} align="middle">
            <Col xs={24} sm={16} md={18}>
              <Form.Item
                name="name"
                style={{ margin: 0 }}
                rules={[
                  { required: true, message: "Ingresá el nombre del grupo" },
                ]}
              >
                <Input
                  style={{ borderRadius: 10, height: 40, fontSize: 14 }}
                  placeholder="Nombre del grupo..."
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                block
                htmlType="submit"
                style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
                loading={addGroupMutation.isPending}
              >
                Agregar
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Lista de grupos */}
      <Flex vertical gap={10}>
        {groups.map((group: GroupDetail) => (
          <SettingGroupCard
            key={group.id}
            group={group}
            onSetDefault={(id) => setDefaultMutation.mutate(id)}
            isSettingDefault={setDefaultMutation.isPending}
          />
        ))}
      </Flex>
    </Card>
  );
}
