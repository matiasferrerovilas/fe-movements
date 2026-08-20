import { Button, Popconfirm, App } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { removeWorkspaceMemberApi } from "@/apis/WorkspaceApi";

interface RemoveMemberButtonProps {
  workspaceId: number;
  userId: number;
  email: string;
}

export default function RemoveMemberButton({ workspaceId, userId, email }: RemoveMemberButtonProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const removeMemberMutation = useMutation({
    mutationFn: () => removeWorkspaceMemberApi(workspaceId, userId),
    onSuccess: () => {
      void message.success(t("settings.currentWorkspace.removeMemberSuccess", { email }));
      void queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
    },
    onError: () => {
      void message.error(t("settings.currentWorkspace.removeMemberError", { email }));
    },
  });

  return (
    <Popconfirm
      title={t("settings.currentWorkspace.removeMemberConfirmTitle", { email })}
      description={t("settings.currentWorkspace.removeMemberConfirmDescription")}
      onConfirm={() => removeMemberMutation.mutate()}
      okText={t("settings.currentWorkspace.removeMemberConfirmOk")}
      cancelText={t("settings.currentWorkspace.removeMemberConfirmCancel")}
      okButtonProps={{ danger: true, loading: removeMemberMutation.isPending }}
      placement="topRight"
    >
      <Button
        type="text"
        danger
        size="small"
        icon={<DeleteOutlined />}
        title={t("settings.currentWorkspace.removeMemberTooltip")}
        aria-label={t("settings.currentWorkspace.removeMemberAriaLabel", { email })}
        loading={removeMemberMutation.isPending}
      />
    </Popconfirm>
  );
}
