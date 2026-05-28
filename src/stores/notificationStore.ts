import { create } from "zustand";

export interface NotificationDto {
  id: number;
  userId: string;
  title: string;
  message: string;
  type:
    | "TASK_ASSIGNED"
    | "TASK_COMPLETED"
    | "TASK_REASSIGNED"
    | "INFO"
    | "WARNING"
    | "ERROR";
  severity: "high" | "medium" | "low";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationStore {
  notifications: NotificationDto[];
  unreadCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  addNotification: (notification: NotificationDto) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  setInitialCount: (counts: {
    unread: number;
    high: number;
    medium: number;
    low: number;
  }) => void;
  setInitialList: (notifications: NotificationDto[]) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  highCount: 0,
  mediumCount: 0,
  lowCount: 0,

  addNotification: (notification: NotificationDto) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
      highCount:
        state.highCount +
        (notification.severity === "high" && !notification.isRead ? 1 : 0),
      mediumCount:
        state.mediumCount +
        (notification.severity === "medium" && !notification.isRead ? 1 : 0),
      lowCount:
        state.lowCount +
        (notification.severity === "low" && !notification.isRead ? 1 : 0),
    })),

  markRead: (id: number) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.isRead) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        highCount:
          notification.severity === "high"
            ? Math.max(0, state.highCount - 1)
            : state.highCount,
        mediumCount:
          notification.severity === "medium"
            ? Math.max(0, state.mediumCount - 1)
            : state.mediumCount,
        lowCount:
          notification.severity === "low"
            ? Math.max(0, state.lowCount - 1)
            : state.lowCount,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    })),

  setInitialCount: (counts) =>
    set({
      unreadCount: counts.unread,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
    }),

  setInitialList: (notifications) =>
    set((state) => {
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      const highCount = notifications.filter(
        (n) => n.severity === "high" && !n.isRead,
      ).length;
      const mediumCount = notifications.filter(
        (n) => n.severity === "medium" && !n.isRead,
      ).length;
      const lowCount = notifications.filter(
        (n) => n.severity === "low" && !n.isRead,
      ).length;

      return {
        notifications,
        unreadCount,
        highCount,
        mediumCount,
        lowCount,
      };
    }),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    }),
}));
