# Feature: tasks

## Purpose
Quản lý công việc (TaskInstance) — xem danh sách task của mình, xem chi tiết, submit khi hoàn thành, comment.

## Files
- `useMyTasks.ts` — Hook lấy danh sách task của user hiện tại (`GET /api/tasks/my`)
- `useTaskDetail.ts` — Hook lấy chi tiết 1 task + comments (`GET /api/tasks/{id}`)
- `TaskSubmitModal.tsx` — Modal để Employee submit task (WAITING_FOR_APPROVAL)
- `CommentThread.tsx` — Thread comments của task (read + add comment)

## API Endpoints Used

| Method | Endpoint | Dùng để |
|--------|----------|---------|
| GET | `/api/tasks/my` | Lấy danh sách task của tôi |
| GET | `/api/tasks/{id}` | Chi tiết task + EfficiencyRatio |
| PATCH | `/api/tasks/{id}/status` | Cập nhật status (Employee submit) |
| GET | `/api/tasks/{taskId}/comments` | Lịch sử comments (ASC) |
| POST | `/api/tasks/{taskId}/comments` | Thêm comment |

## Types (từ @/types/employee hoặc inline)
```ts
interface TaskDto {
  id: number;
  taskCode: string;           // "TASK-20260601-0001"
  title: string;
  description: string | null;
  status: TaskStatus;
  taskTypeName: string;
  standardTimeMinutes: number | null;
  assignedUserName: string;
  expectedCompletion: string; // ISO datetime
  createdAt: string;
}

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'WAITING_FOR_APPROVAL' | 'REJECTED';
```

## Task State Machine
```
PENDING → IN_PROGRESS (Time Tracking START)
IN_PROGRESS → PAUSED (Time Tracking PAUSE)
PAUSED → IN_PROGRESS (Time Tracking RESUME)
IN_PROGRESS → WAITING_FOR_APPROVAL (Employee submit via TaskSubmitModal)
WAITING_FOR_APPROVAL → COMPLETED (Manager approve)
WAITING_FOR_APPROVAL → REJECTED (Manager reject)
Any → CANCELLED (Manager/Admin only)
```

## Business Rules
- Employee chỉ thấy task được assign cho mình
- Manager thấy task của cả dept + team lead
- Comment là IMMUTABLE — không có edit/delete (audit trail)
- Comment sort theo `CreatedAt ASC` — đọc như chat thread
- `IsOwnComment` từ BE — dùng để style bubble chat

## Row-level Access
| Role | Thấy task của ai |
|------|--------------------|
| Admin/CEO/HR | Tất cả |
| Manager | Users trong dept + team mình |
| Employee | Chỉ task của chính mình |

## Routing
Task detail mở trong dashboard tab: `window.location.hash = '#/admin/task/' + taskId`
