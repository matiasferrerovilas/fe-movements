import { useState } from "react";
import ModalComponent from "../Modal";
import { Button, Form, Input } from "antd";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import { useMutation } from "@tanstack/react-query";
import type {
  CreateInvitationForm,
  WorkspaceDetail,
} from "../../../models/UserWorkspace";
import { addInvitationWorkspaceApi } from "../../../apis/WorkspaceApi";
import { ColorEnum } from "../../../enums/ColorEnum";
import { useCurrentUser } from "../../../apis/hooks/useCurrentUser";
import { getEntityLabels } from "../../utils/entityLabels";

interface InviteUserToWorkspaceProps {
  group: WorkspaceDetail;
}
export default function InviteUserToWorkspace({ group }: InviteUserToWorkspaceProps) {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const addInvitationMutation = useMutation({
    mutationFn: (invitation: CreateInvitationForm) =>
      addInvitationWorkspaceApi(invitation),
    onError: (err) => {
      console.error("Error creando Invitacion:", err);
    },
    onSuccess: () => {
      console.debug("✅ Invitacion creada correctamente");
      handleCloseModal();
    },
  });

  const handleSubmit = (values: { email: string }) => {
    addInvitationMutation.mutate({
      emails: [values.email],
      workspaceId: group.id,
    });
  };

  return (
    <>
      <Button
        type="text"
        icon={<UserAddOutlined style={{ fontSize: 22, cursor: "pointer" }} />}
        style={{
          color: ColorEnum.TEXTO_ACTIVO_AZUL,
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 18,
        }}
        onClick={() => setModalOpen(true)}
        title={labels.miembroInvitar}
      ></Button>
      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        title={labels.miembroInvitar}
        footer={
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            loading={addInvitationMutation.isPending}
            onClick={() => form.submit()}
          >
            Enviar invitación
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={addInvitationMutation.isPending}
        >
          <Form.Item
            label={labels.miembroEmail}
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa un correo" },
              { type: "email", message: "Ingresa un correo válido" },
            ]}
          >
            <Input placeholder="usuario@ejemplo.com" />
          </Form.Item>
        </Form>
      </ModalComponent>
    </>
  );
}
