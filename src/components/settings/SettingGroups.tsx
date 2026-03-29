import { Button, Card, Col, Input, Row, Typography, Form } from "antd";
import { useAllGroupsWithUsers } from "../../apis/hooks/useGroups";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import SettingGroupCard from "./SettingGroupCard";
import type {
  CreateGroupForm,
  GroupsWithMembers,
} from "../../models/UserGroup";
import { useMutation } from "@tanstack/react-query";
import { useGroupsSubscription } from "../../apis/websocket/useGroupsSubscription";
import { addGroupApi, setDefaultGroupApi } from "../../apis/GroupApi";
import { useUserDefault } from "../../apis/hooks/useSettings";

const { Title, Text } = Typography;

const css = `
  .create-group-card {
    border-radius: 14px !important;
    border: 1.5px dashed #b6c8e8 !important;
    background: linear-gradient(135deg, #f8faff 0%, #eef3fb 100%) !important;
    margin-bottom: 20px;
  }
  .create-group-input {
    background: #fff !important;
    border: 1.5px solid #e0eaff !important;
    border-radius: 10px !important;
    height: 40px !important;
    font-size: 14px !important;
    transition: border-color 0.2s !important;
  }
  .create-group-input:focus, .create-group-input:hover {
    border-color: #4f9cf7 !important;
  }
  .create-group-btn {
    height: 40px !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    background: linear-gradient(90deg, #1a6fd4, #4f9cf7) !important;
    border: none !important;
    color: #fff !important;
    box-shadow: 0 2px 10px rgba(26, 111, 212, 0.25) !important;
    transition: all 0.2s ease !important;
  }
  .create-group-btn:hover {
    opacity: 0.88 !important;
    transform: translateY(-1px) !important;
  }
`;

export function SettingGroups() {
  const { data: groups = [], isLoading } = useAllGroupsWithUsers();
  const { data: defaultAccount } = useUserDefault("DEFAULT_ACCOUNT");
  const [form] = Form.useForm<CreateGroupForm>();

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
    <>
      <style>{css}</style>
      <Card loading={isLoading} style={{ borderRadius: 16 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #1a6fd4, #4f9cf7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(26,111,212,0.25)",
            }}
          >
            <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: "#1a3a6b" }}>
              Gestionar Grupos
            </Title>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              Crea y administra grupos para organizar tus gastos.
            </Text>
          </div>
        </div>

        <div style={{ height: 1, background: "#f0f4ff", margin: "14px 0" }} />

        {/* Crear grupo */}
        <Card
          className="create-group-card"
          styles={{ body: { padding: "14px 16px" } }}
        >
          <Text
            strong
            style={{
              fontSize: 13,
              color: "#374151",
              display: "block",
              marginBottom: 10,
            }}
          >
            Nuevo Grupo
          </Text>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[12, 0]} align="middle">
              <Col xs={24} sm={16} md={18}>
                <Form.Item name="description" style={{ margin: 0 }}>
                  <Input
                    className="create-group-input"
                    placeholder="Nombre del grupo..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6} style={{ paddingTop: 0 }}>
                <Button
                  icon={<PlusOutlined />}
                  block
                  htmlType="submit"
                  className="create-group-btn"
                  loading={addGroupMutation.isPending}
                  style={{ marginTop: 0 }}
                >
                  Crear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Lista de grupos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groups?.map((group: GroupsWithMembers) => (
            <SettingGroupCard
              key={group.id}
              group={group}
              defaultGroupId={defaultAccount?.value}
              onSetDefault={setDefaultMutation.mutate}
              isSettingDefault={setDefaultMutation.isPending}
            />
          ))}
        </div>
      </Card>
    </>
  );
}
