import {
  useNotificationStore,
  type NotificationDto,
} from "./notificationStore";

export type IncomingNotification = {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  taskInstanceId?: number;
  actionUrl?: string;
};

type NotifyInput = {
  title: string;
  message: string;
  type?: NotificationDto["type"];
  severity?: NotificationDto["severity"];
  userId?: string;
  isRead?: boolean;
  taskInstanceId?: number;
  actionUrl?: string;
  createdAt?: string;
};

const inferSeverity = (
  type: NotificationDto["type"],
): NotificationDto["severity"] => {
  switch (type) {
    case "ERROR":
      return "high";
    case "WARNING":
      return "medium";
    default:
      return "low";
  }
};

export const normalizeIncomingNotification = (
  notification: any,
): NotificationDto => ({
  ...notification,
  taskInstanceId: notification.taskInstanceId ?? notification.relatedTaskId ?? notification.RelatedTaskId,
  type: notification.type as NotificationDto["type"],
  severity: inferSeverity(notification.type as NotificationDto["type"]),
});

export function notify(input: NotifyInput) {
  const type = input.type ?? "INFO";

  useNotificationStore.getState().addNotification({
    id: Date.now(),
    userId: input.userId ?? "",
    title: input.title,
    message: input.message,
    type,
    severity: input.severity ?? inferSeverity(type),
    isRead: input.isRead ?? false,
    createdAt: input.createdAt ?? new Date().toISOString(),
    taskInstanceId: input.taskInstanceId,
    actionUrl: input.actionUrl,
  });
}
