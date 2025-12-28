import { useState } from "react";
import ModalComponent from "../Modal";
import { Button, Form, Input } from "antd";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import { useMutation } from "@tanstack/react-query";
import type {
  CreateInvitationForm,
  AccountsWithUsersCount,
} from "../../../models/UserGroup";
import { addInvitationGroupApi } from "../../../apis/GroupApi";
import { ColorEnum } from "../../../enums/ColorEnum";

interface InviteUserToGroupProps {
  group: AccountsWithUsersCount;
}
export default function InviteUserToGroup({ group }: InviteUserToGroupProps) {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const addInvitationMutation = useMutation({
    mutationFn: (invitation: CreateInvitationForm) =>
      addInvitationGroupApi(invitation),
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
      accountId: group.accountId,
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
        title="Invitar miembro"
      ></Button>
      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        title="Invitar miembro al grupo"
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
            label="Correo electrónico del usuario"
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
