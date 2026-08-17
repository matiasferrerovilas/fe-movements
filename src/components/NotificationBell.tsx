import { useState } from "react";
import { Badge, Button, Divider, Empty, List, Popover, Typography, theme } from "antd";
import BellOutlined from "@ant-design/icons/BellOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import WarningOutlined from "@ant-design/icons/WarningOutlined";
import dayjs from "dayjs";
import { useMarkNotificationsRead, useNotifications } from "@/apis/hooks/useNotifications";
import { NotificationSeverity } from "@/models/AppNotification";

const { Text } = Typography;

const SEVERITY_ICON: Record<NotificationSeverity, React.ReactNode> = {
  [NotificationSeverity.INFO]: <InfoCircleOutlined />,
  [NotificationSeverity.SUCCESS]: <CheckCircleOutlined />,
  [NotificationSeverity.WARNING]: <WarningOutlined />,
  [NotificationSeverity.ERROR]: <CloseCircleOutlined />,
};

export default function NotificationBell() {
  const { token } = theme.useToken();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const severityColor: Record<NotificationSeverity, string> = {
    [NotificationSeverity.INFO]: token.colorInfo,
    [NotificationSeverity.SUCCESS]: token.colorSuccess,
    [NotificationSeverity.WARNING]: token.colorWarning,
    [NotificationSeverity.ERROR]: token.colorError,
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  };

  const content = (
    <div style={{ width: 320 }}>
      <div style={{ padding: "12px 16px" }}>
        <Text strong>Notificaciones</Text>
      </div>
      <Divider style={{ margin: 0 }} />
      {notifications.length === 0 ? (
        <Empty
          description="Sin notificaciones"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 24 }}
        />
      ) : (
        <List
          style={{ maxHeight: 360, overflowY: "auto" }}
          dataSource={notifications}
          renderItem={(n) => (
            <List.Item
              style={{
                padding: "10px 16px",
                background: n.read ? "transparent" : token.colorFillTertiary,
              }}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ color: severityColor[n.severity], fontSize: 16 }}>
                    {SEVERITY_ICON[n.severity]}
                  </span>
                }
                title={<Text style={{ fontSize: 13 }}>{n.title}</Text>}
                description={
                  <>
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                      {n.message}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(n.createdAt).fromNow()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      styles={{ root: { marginTop: 8 }, content: { padding: 0 } }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          aria-label="Notificaciones"
        />
      </Badge>
    </Popover>
  );
}
