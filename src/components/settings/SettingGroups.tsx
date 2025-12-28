import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  theme,
  Typography,
  Form,
} from "antd";
import { useAllGroupsWithUsers } from "../../apis/hooks/useGroups";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import SettingGroupCard from "./SettingGroupCard";
import type {
  CreateGroupForm,
  AccountsWithUsersCount,
} from "../../models/UserGroup";
import { useMutation } from "@tanstack/react-query";
import { useGroupsSubscription } from "../../apis/websocket/useGroupsSubscription";
import { addGroupApi } from "../../apis/GroupApi";
const { Title } = Typography;

export function SettingGroups() {
  const { data: groups = [], isLoading } = useAllGroupsWithUsers();
  const { token } = theme.useToken();
  const [form] = Form.useForm<CreateGroupForm>();

  useGroupsSubscription();

  const addGroupMutation = useMutation({
    mutationFn: ({ group }: { group: CreateGroupForm }) => addGroupApi(group),
    onError: (err) => {
      console.error("Error subiendo archivo:", err);
    },
  });

  const onFinish = (values: CreateGroupForm) => {
    addGroupMutation.mutate({ group: values });
    form.resetFields();
  };

  return (
    <Card loading={isLoading}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={12}>
          <Space align="baseline">
            <TeamOutlined style={{ fontSize: 20, color: "#0D59A4" }} />
            <Title level={5} style={{ margin: 0 }}>
              Gestionar Grupos
            </Title>
          </Space>
          <Typography.Paragraph
            style={{
              color: token.colorTextSecondary,
              marginBottom: 16,
            }}
          >
            Crea y administra grupos para organizar tus gastos.
          </Typography.Paragraph>
        </Col>
      </Row>
      <Card
        style={{
          borderRadius: 12,
          background: "#e8ebf0",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            color: "#111827",
          }}
        >
          Crear Nuevo Grupo
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={12} lg={24}>
              <Form.Item
                name="description"
                style={{ width: "100%", marginBlock: 10 }}
              >
                <Input
                  placeholder="Nombre del Grupo"
                  style={{
                    background: "#f9fbfd",
                    border: "none",
                    borderRadius: 8,
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={18} lg={24}>
              <Button
                icon={<PlusOutlined />}
                block
                htmlType="submit"
                variant="outlined"
                style={{
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 500,
                  height: 40,
                }}
              >
                Crear Grupo
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
        {groups?.map((group: AccountsWithUsersCount) => (
          <SettingGroupCard group={group} />
        ))}
      </Space>
    </Card>
  );
}
