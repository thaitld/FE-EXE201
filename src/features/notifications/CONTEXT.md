# Feature: notifications

## Purpose
Quản lý thông báo real-time qua SignalR + lịch sử notifications.  
Notifications được load khi login và cập nhật live qua SignalR hub.

## Files
- `notificationStore.ts` — Zustand store cho notifications list + unread counts
- `NotificationsPanel.tsx` — Panel hiển thị danh sách notifications (slide-out)
- `AlertBell.tsx` — Bell icon với badge số unread (ở header)
- `notify.ts` — Helper functions (toast notifications)

## State (Zustand Store)
```ts
// useNotificationStore
{
  notifications: NotificationDto[],
  unreadCount: number,
  highCount: number,
  mediumCount: number,
  lowCount: number,
  
  // Actions
  addNotification(notification),     // SignalR push
  markRead(id),
  markUnread(id),
  markAllRead(),
  setInitialCount(counts),           // từ GET /alerts/count khi login
  setInitialList(notifications),     // từ GET /notifications khi login
  clearAll(),                        // khi logout
}
```

## Notification Types
```ts
type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "TASK_REASSIGNED"
  | "TASK_COMMENT"
  | "TASK_SUBMITTED"
  | "INFO"
  | "WARNING"
  | "ERROR";

type Severity = "high" | "medium" | "low";
```

## API Endpoints Used

| Method | Endpoint | Dùng để |
|--------|----------|---------|
| GET | `/api/notifications` | Initial list khi login |
| GET | `/api/alerts/count` | Badge counts (unread/high/medium/low) |
| PATCH | `/api/alerts/read` | Mark đã đọc |

## SignalR Integration
- Kết nối được quản lý ở `AuthContext.tsx` — KHÔNG tạo connection mới ở đây
- Event: `"ReceiveNotification"` → gọi `useNotificationStore.getState().addNotification()`
- `src/lib/signalr.ts` xuất: `createSignalRConnection`, `startConnection`, `stopConnection`, `onReceiveNotification`

## Usage Pattern
```tsx
// Đọc store trong component
const { notifications, unreadCount } = useNotificationStore();

// Thêm notification từ SignalR (đã setup ở AuthContext)
useNotificationStore.getState().addNotification(notification);

// Mark read
useNotificationStore.getState().markRead(id);
```

## Important
- **Đừng tạo SignalR connection mới** — connection đã được quản lý ở `AuthContext`
- `highCount` → badge màu đỏ (urgent)
- Notifications được giữ trong Zustand (không re-fetch mỗi render)
