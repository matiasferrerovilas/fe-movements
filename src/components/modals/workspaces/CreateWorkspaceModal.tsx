import { useState } from "react";
import { Button, Form, Input } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateWorkspaceForm } from "../../../models/UserWorkspace";
import { addWorkspaceApi } from "../../../apis/WorkspaceApi";
import ModalComponent from "../Modal";

interface CreateWorkspaceModalProps {
  /** Render prop for the trigger element */
  children: (openModal: () => void) => React.ReactNode;
}

export default function CreateWorkspaceModal({ children }: CreateWorkspaceModalProps) {
  const [form] = Form.useForm<CreateWorkspaceForm>();
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

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
        title="Crear nuevo workspace"
        width={400}
        footer={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={addWorkspaceMutation.isPending}
            onClick={() => form.submit()}
          >
            Crear workspace
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
            label="Nombre del workspace"
            name="description"
            rules={[
              { required: true, message: "Ingresa el nombre del workspace" },
            ]}
          >
            <Input placeholder="Ej: Familia, Trabajo, Personal..." />
          </Form.Item>
        </Form>
      </ModalComponent>
    </>
  );
}
