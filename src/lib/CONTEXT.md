# Lib — Core Utilities

## Purpose
Các module dùng chung cho toàn app — HTTP client, SignalR, types, utils.

## Files

### `api.ts` — HTTP Client + All API Functions
**QUAN TRỌNG**: File này chứa TẤT CẢ API calls và shared types.

```ts
// Import pattern đúng
import { apiClient } from '@/lib/api';
import type { ApiResponse, UserDto, PagedResult } from '@/lib/api';

// Import specific API functions
import { getMyTasks, updateTaskStatus, submitSurvey } from '@/lib/api';
```

**`apiClient`** = axios instance đã configured:
- Base URL: `VITE_API_BASE_URL` hoặc `http://localhost:5211/api`
- Auto-attach Bearer token từ `localStorage.getItem("auth_token")`
- Content-Type: application/json

**Key Types exported từ api.ts:**
```ts
ApiResponse<T>     // { succeeded, message, data }
PagedResult<T>     // { items, totalCount, pageNumber, pageSize, totalPages, ... }
UserDto            // { id, email, firstName, lastName, roleName, avatarUrl, ... }
DepartmentDto      // { id, name, managerUserId, isActive, teamCount }
TeamDetailDto      // { id, code, name, departmentId, teamLeadUserId, ... }
RoleDto            // { id, name, normalizedName }
```

**Key API Functions trong api.ts:**
```
Auth:          (dùng trực tiếp trong pages/auth/)
Dashboard:     getPersonalDashboard()
Tasks:         getMyTasks(), getTasks(), getTaskDetail(), updateTaskStatus()
               getTaskComments(), addTaskComment()
               getTaskAttachments(), uploadSubmissionAttachment()
Time Track:    startTimeTracking(), pauseTimeTracking(), resumeTimeTracking()
               stopTimeTracking(), getActiveTimeSession()
Survey:        getSurveyStatus(), submitSurvey(), getSurveyHistory()
Burnout:       getPersonalBurnoutSignals(), getPersonalBehavioralPatterns()
Notifications: getNotifications(), markNotificationAsRead(), markAllNotificationsAsRead()
User:          (trong AuthContext: /users/me, /alerts/count, /notifications)
```

### `signalr.ts` — SignalR Connection Manager
```ts
import {
  createSignalRConnection,
  startConnection,
  stopConnection,
  onReceiveNotification,
} from '@/lib/signalr';
```

- Connection hub: `/hubs/notifications`
- Token: từ `localStorage.getItem("auth_token")`
- Managed ở `AuthContext.tsx` — KHÔNG tạo connection ở nơi khác

### `utils.ts` — Utility Functions
Các helper functions nhỏ (formatDate, className merge...)

### `notify.ts` — Toast Notifications
Helper để show toast (success/error/warning)

## ⚠️ Rules

1. **KHÔNG tạo axios instance mới** — Luôn dùng `apiClient` từ `@/lib/api`
2. **KHÔNG tạo SignalR connection mới** — Managed ở `AuthContext`
3. Nếu cần thêm API call mới → thêm vào cuối `api.ts`
4. Types dùng chung → define trong `api.ts` hoặc `src/types/`
