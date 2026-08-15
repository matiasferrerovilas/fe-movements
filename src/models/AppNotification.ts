export const NotificationSeverity = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const;
export type NotificationSeverity =
  (typeof NotificationSeverity)[keyof typeof NotificationSeverity];

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  createdAt: string;
}

export interface AppNotificationEntry extends AppNotification {
  read: boolean;
}
