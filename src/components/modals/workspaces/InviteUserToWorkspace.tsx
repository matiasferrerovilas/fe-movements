import { useState } from "react";
import ModalComponent from "@/components/modals/Modal";
import { Button, Form, Input, Select } from "antd";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type {
  CreateInvitationForm,
  Workspace,
} from "@/models/UserWorkspace";
import { addInvitationWorkspaceApi } from "@/apis/WorkspaceApi";
import { ColorEnum } from "@/enums/ColorEnum";
import { WorkspaceRoleEnum } from "@/enums/WorkspaceRoleEnum";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

interface InviteUserToWorkspaceProps {
  group: Workspace;
}
export default function InviteUserToWorkspace({ group }: InviteUserToWorkspaceProps) {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null, t);
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

  const handleSubmit = (values: { email: string; role: WorkspaceRoleEnum }) => {
    addInvitationMutation.mutate({
      emails: [values.email],
      workspaceId: group.workspaceId,
      role: values.role,
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
        aria-label={labels.miembroInvitar}
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
            {t("settings.inviteWorkspace.sendInvitationButton")}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={addInvitationMutation.isPending}
          initialValues={{ role: WorkspaceRoleEnum.COLLABORATOR }}
        >
          <Form.Item
            label={labels.miembroEmail}
            name="email"
            rules={[
              { required: true, message: t("settings.inviteWorkspace.emailRequired") },
              { type: "email", message: t("settings.inviteWorkspace.emailInvalid") },
            ]}
          >
            <Input placeholder={t("settings.inviteWorkspace.emailPlaceholder")} />
          </Form.Item>
          <Form.Item
            label={t("settings.inviteWorkspace.roleLabel")}
            name="role"
            rules={[
              { required: true, message: t("settings.inviteWorkspace.roleRequired") },
            ]}
          >
            <Select
              options={[
                {
                  value: WorkspaceRoleEnum.COLLABORATOR,
                  label: t("settings.inviteWorkspace.roleCollaborator"),
                },
                {
                  value: WorkspaceRoleEnum.READ_ONLY,
                  label: t("settings.inviteWorkspace.roleReadOnly"),
                },
              ]}
            />
          </Form.Item>
        </Form>
      </ModalComponent>
    </>
  );
}
