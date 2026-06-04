import { useNotificationStore } from "@/features/notifications/notificationStore";
import type { NotificationDto } from "@/features/notifications/notificationStore";

export function notify(
  payload: Partial<NotificationDto> & { title?: string; message: string },
) {
  const { addNotification } = useNotificationStore.getState();
  const notification: NotificationDto = {
    id: Math.floor(Math.random() * 1000000),
    userId: "", // Will be set server-side
    title: payload.title || "Notification",
    message: payload.message,
    type: (payload.type as any) || "INFO",
    severity: payload.severity || "low",
    isRead: false,
    createdAt: new Date().toISOString(),
    taskInstanceId: payload.taskInstanceId,
    actionUrl: payload.actionUrl,
  };
  addNotification(notification);
}
