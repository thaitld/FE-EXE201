# Feature: time-tracking

## Purpose
Quản lý timer làm việc — Start/Pause/Resume/Stop session cho một task.  
Tự động recover session đang chạy khi user reload trang.

## Files
- `useTimeTracking.ts` — Hook chính quản lý toàn bộ timer state
- `TimeTracker.tsx` — UI component hiển thị timer + controls

## API Endpoints Used (từ @/lib/api)

| Function | Method | Endpoint |
|----------|--------|----------|
| `startTimeTracking(taskId)` | POST | `/api/tasks/{taskId}/time/start` |
| `pauseTimeTracking(taskId, sessionId)` | POST | `/api/tasks/{taskId}/time/pause` |
| `resumeTimeTracking(taskId, sessionId)` | POST | `/api/tasks/{taskId}/time/resume` |
| `stopTimeTracking(taskId, sessionId, note?)` | POST | `/api/tasks/{taskId}/time/stop` |
| `getActiveTimeSession()` | GET | `/api/tasks/time/active` |

## useTimeTracking() returns
```ts
{
  session: TimeTrackingSessionDto | null,  // null = không có session
  elapsedSeconds: number,
  isRunning: boolean,
  isPaused: boolean,
  loading: boolean,
  timeLabel: string,    // "MM:SS" format
  start: (taskId: number) => Promise<void>,
  pause: (taskId: number) => Promise<ApiResponse | null>,
  resume: (taskId: number) => Promise<ApiResponse | null>,
  stop: (taskId: number, note?: string) => Promise<ApiResponse | null>,
  restore: () => Promise<void>,   // recover session sau reload
}
```

## Business Rules (CRITICAL)
- **1 session RUNNING per user** — chỉ có 1 task RUNNING tại 1 thời điểm
- Nếu đang có session RUNNING → phải STOP trước khi START task khác
- `restore()` gọi khi component mount để recover timer từ server
- Timer đếm local bằng `setInterval(1s)` — không sync real-time với server
- `DurationSeconds` chỉ tính thời gian thực làm (bỏ qua pause)

## Session Flow
```
START  → nhận sessionId mới → task → IN_PROGRESS → timer chạy
PAUSE  → timer dừng → task → PAUSED
RESUME → timer tiếp tục (dùng sessionId cũ) → task → IN_PROGRESS
STOP   → timer reset → task → COMPLETED (hoặc WAITING_FOR_APPROVAL)
```

## Types
```ts
interface TimeTrackingSessionDto {
  sessionId: string;          // GUID
  taskInstanceId: number;
  taskCode: string;
  taskTitle: string;
  currentAction: "STARTED" | "PAUSED" | "RESUMED";
  lastActionAt: string;       // ISO datetime
  elapsedSeconds: number;     // accumulated (không tính pause)
}
```
