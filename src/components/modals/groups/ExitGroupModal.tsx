import { Button, Popconfirm } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GroupsWithMembers } from "../../../models/UserGroup";
import { exitGroupApi } from "../../../apis/GroupApi";

interface ExitGroupModalProps {
  group: GroupsWithMembers;
}
export default function ExitGroupModal({ group }: ExitGroupModalProps) {
  const queryClient = useQueryClient();
  const exitGroupMutation = useMutation({
    mutationFn: () => exitGroupApi(group.id),
    onError: (err) => {
      console.error("Error saliendo del grupo:", err);
    },
    onSuccess: () => {
      console.debug("✅ Has salido del grupo correctamente");
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      queryClient.invalidateQueries({ queryKey: ["user-groups-count"] });
    },
  });

  return (
    <Popconfirm
      title="¿Estás seguro de que quieres salir del grupo?"
      onConfirm={() => exitGroupMutation.mutate()}
      okText="Sí"
      cancelText="No"
      placement="topRight"
    >
      <Button
        type="text"
        icon={<DeleteOutlined style={{ fontSize: 22, cursor: "pointer" }} />}
        style={{
          color: "#ff4d4f",
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 18,
        }}
        title="Salir del grupo"
      />
    </Popconfirm>
  );
}
