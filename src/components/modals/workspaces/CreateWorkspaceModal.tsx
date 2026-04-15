import { useState } from "react";
import { Button, Form, Input } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateWorkspaceForm } from "../../../models/UserWorkspace";
import { addWorkspaceApi } from "../../../apis/WorkspaceApi";
import ModalComponent from "../Modal";
import { useCurrentUser } from "../../../apis/hooks/useCurrentUser";
import { getEntityLabels } from "../../utils/entityLabels";

interface CreateWorkspaceModalProps {
  /** Render prop for the trigger element */
  children: (openModal: () => void) => React.ReactNode;
}

export default function CreateWorkspaceModal({ children }: CreateWorkspaceModalProps) {
  const [form] = Form.useForm<CreateWorkspaceForm>();
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const addWorkspaceMutation = useMutation({
    mutationFn: (workspace: CreateWorkspaceForm) => addWorkspaceApi(workspace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      handleCloseModal();
    },
    onError: (err) => console.error("Error creando workspace:", err),
  });

  const handleSubmit = (values: CreateWorkspaceForm) => {
    addWorkspaceMutation.mutate(values);
  };

  return (
    <>
      {children(handleOpenModal)}
      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        title={labels.workspaceNuevo}
        width={400}
        footer={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={addWorkspaceMutation.isPending}
            onClick={() => form.submit()}
          >
            {labels.workspaceCrear}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={addWorkspaceMutation.isPending}
        >
          <Form.Item
            label={labels.workspaceNombreLabel}
            name="description"
            rules={[
              { required: true, message: `Ingresa el nombre del ${labels.workspaceSingular}` },
            ]}
          >
            <Input placeholder={labels.workspacePlaceholder} />
          </Form.Item>
        </Form>
      </ModalComponent>
    </>
  );
}
