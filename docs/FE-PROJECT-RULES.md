# Frontend Project Rules — MANTO EXE

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 + Vite | Framework |
| TypeScript (strict) | Language |
| Zustand | Auth global state |
| Tailwind CSS | Styling |
| React Hook Form | Forms |
| Axios | HTTP client |
| SignalR | Real-time notifications |
| Recharts | Charts/visualization |
| Motion / GSAP | Animations |
| Lucide React | Icons |

> **Không dùng**: TanStack Query, React Router v6/v7 (dùng hash routing thủ công)

---

## 1. Feature Structure

```
src/
├── features/
│   ├── auth/           # RoleGate, auth utilities
│   ├── dashboard/      # Dashboard panels per role
│   ├── tasks/          # Task CRUD, detail, create
│   ├── time-tracking/  # Timer, session management
│   ├── survey/         # Monthly survey
│   └── notifications/  # SignalR real-time
├── components/
│   ├── ui/             # Button, Input, Modal, Badge
│   ├── layout/         # Header, Footer, Sidebar
│   └── panels/         # Role-specific dashboard panels
│       ├── admin/
│       ├── employee/
│       └── shared/
├── pages/
│   ├── auth/           # Login, ForgotPassword, ResetPassword, GoogleAuthCallback
│   ├── shared/         # Homepage, ChangePassword, NotAuthorized
│   └── Dashboard.tsx   # Main shell with tab routing
├── router/
│   └── AppRouter.tsx   # Hash-based routing logic
├── contexts/
│   └── AuthContext.tsx # User, token, isAuthenticated
├── lib/
│   └── axios.ts        # Axios instance + interceptors
└── types/              # Shared types
```

**Each feature folder:**
```
features/[feature-name]/
├── components/         # Feature-specific components
├── hooks/              # Custom hooks (data + logic)
├── services/           # API calls (axios)
├── types/              # Feature-specific types
├── pages/              # Feature pages (if needed)
├── index.ts            # Barrel exports
└── CONTEXT.md          # Feature context for AI agents
```

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Feature folders | kebab-case | `time-tracking/` |
| Components | PascalCase | `TaskCard.tsx` |
| Hooks | camelCase + use | `useTasks.ts` |
| Services | .service suffix | `task.service.ts` |
| Types | .types suffix | `task.types.ts` |
| Pages | PascalCase + Page | `TaskDetailPage.tsx` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Panels | PascalCase + Panel | `EmployeePerformancePanel.tsx` |

---

## 3. Feature Rules

### Feature Boundaries

| Feature | Owns |
|---------|------|
| auth | RoleGate, login/logout utils, token parsing |
| dashboard | Role-specific dashboard panels, tab routing |
| tasks | Task list, task detail, create task, reassign, bulk |
| time-tracking | Timer, start/pause/resume/stop, session recovery |
| survey | Monthly survey form, status check, history |
| notifications | Bell icon, notification list, SignalR connection |

### Cross-Feature Communication

```tsx
// ✅ DO: Import from barrel file
import { RoleGate } from '@/features/auth';

// ✅ DO: Use AuthContext for user info
const { user, isAuthenticated } = useAuth();

// ✅ DO: Use hash navigation
window.location.hash = '#/admin/task/' + taskId;

// ❌ DON'T: Import feature internals directly
import { TaskCard } from '../tasks/components/TaskCard'; // WRONG
```

---

## 4. Code Patterns

### API Calls (Service Pattern)

```tsx
// services/task.service.ts
import axiosInstance from '@/lib/axios';
import type { ApiResponse, PagedResult } from '@/types';
import type { TaskDto, CreateTaskDto } from '../types/task.types';

export const taskService = {
  getMyTasks: () =>
    axiosInstance.get<ApiResponse<TaskDto[]>>('/api/tasks/my'),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<TaskDetailDto>>(`/api/tasks/${id}`),

  create: (data: CreateTaskDto) =>
    axiosInstance.post<ApiResponse<TaskDto>>('/api/tasks', data),

  updateStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<null>>(`/api/tasks/${id}/status`, { status }),
};

// ❌ DON'T: Direct axios calls in components
useEffect(() => { axios.get('/api/tasks')... }, []); // WRONG
```

### State Management in Components

```tsx
// ✅ Local state for UI + data fetching
const [tasks, setTasks] = useState<TaskDto[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await taskService.getMyTasks();
      if (res.data.succeeded) setTasks(res.data.data ?? []);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  fetchTasks();
}, []);

// ✅ AuthContext for user info
const { user, isAuthenticated } = useAuth();
```

### Hash Navigation

```tsx
// Route constants
export const ROUTES = {
  HOME: '#/',
  LOGIN: '#/login',
  FORGOT_PASSWORD: '#/forgot-password',
  RESET_PASSWORD: '#/reset-password',
  CHANGE_PASSWORD: '#/change-password',
  SURVEY: '#/survey',
  ADMIN: '#/admin',
  ADMIN_USER_MANAGEMENT: '#/admin/user-management',
  ADMIN_PROFILE: '#/admin/profile',
  ADMIN_TASK_DETAIL: (id: number) => `#/admin/task/${id}`,
} as const;

// Navigate
window.location.hash = ROUTES.LOGIN;
window.location.hash = ROUTES.ADMIN_TASK_DETAIL(taskId);
```

### Form Handling

```tsx
// ✅ DO: React Hook Form (no Zod required — optional)
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  try {
    const res = await authService.login(data);
    if (res.data.succeeded) {
      login(res.data.data!.token);
      window.location.hash = ROUTES.ADMIN;
    }
  } catch (err) {
    setError('Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

### Authentication

```tsx
// ✅ AuthContext usage
const { user, token, isAuthenticated, login, logout } = useAuth();

// ✅ Axios interceptor — auto-attach Bearer token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ RoleGate for permission control
<RoleGate allowedRoles={['Admin', 'Manager']} fallback={<NotAuthorized />}>
  <AdminOnlyPanel />
</RoleGate>
```

### SignalR (Notifications)

```tsx
// hooks/useNotificationHub.ts
import * as signalR from '@microsoft/signalr';

export function useNotificationHub() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  useEffect(() => {
    if (!token) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    connection.start().catch(console.error);
    return () => { connection.stop(); };
  }, [token]);

  return { notifications };
}
```

---

## 5. Anti-Patterns (DON'T)

| ❌ DON'T | ✅ DO |
|----------|-------|
| Dùng TanStack Query | useState + service calls trực tiếp |
| Import feature internals | Dùng barrel exports (index.ts) |
| Direct axios trong component | Tạo service file riêng |
| `useEffect` loop polling | Dùng SignalR hoặc manual refresh |
| Server data trong Zustand | useState trong component |
| Hardcode route strings | Dùng `ROUTES` constants |
| Inline styles | Dùng Tailwind classes |
| Dùng `any` type | TypeScript strict types |
| localStorage cho token trực tiếp | Qua AuthContext wrapper |
| Role check trong mọi component | Dùng `RoleGate` component |

---

## 6. Component Rules

```tsx
// Structure: Imports → Types → Component → Export

// 1. Imports
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { taskService } from '../services/task.service';

// 2. Types
interface Props {
  teamId: number;
  onTaskSelect: (id: number) => void;
}

// 3. Component (max 250 lines — extract sub-components if larger)
export const TaskList = ({ teamId, onTaskSelect }: Props) => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // fetch logic
  }, [teamId]);

  if (isLoading) return <TaskListSkeleton />;
  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onSelect={onTaskSelect} />
      ))}
    </div>
  );
};
```

---

## 7. Dashboard Tab Pattern

Dashboard dùng tab-based routing với hash:

```tsx
// pages/Dashboard.tsx
const TAB_MAP: Record<string, string> = {
  '': 'overview',
  'user-management': 'user-management',
  'profile': 'profile',
  'task-detail': 'task-detail',
};

// Panel components per role + tab
const PANEL_MAP = {
  Admin: { overview: <AdminDashboard />, 'user-management': <UserManagement /> },
  Manager: { overview: <ManagerDashboard /> },
  Employee: { overview: <EmployeeDashboard /> },
  // ...
};
```

---

## 8. Git Workflow

### Branch Naming
```
feature/task-time-tracking
fix/survey-submit-validation
refactor/notification-signalr
```

### Commit Messages
```
feat: add task time tracking timer
fix: correct burnout signal display
style: improve dashboard layout
chore: update API types from backend
```

### PR Requirements
- ✅ One feature/fix per PR
- ✅ Screenshots for UI changes
- ✅ Update CONTEXT.md if logic changes

---

## 9. Testing

| Focus Area | Priority |
|------------|----------|
| Auth flow (login/logout/token) | Critical |
| Time tracking (start/pause/stop) | High |
| Task status transitions | High |
| Survey submit (once per month) | High |
| Role-based visibility | Medium |
| Dashboard data loading | Medium |

```tsx
// TaskCard.test.tsx
describe('TaskCard', () => {
  it('should display task status badge', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
  });
  
  it('should call onSelect when clicked', async () => {
    render(<TaskCard task={mockTask} onSelect={mockSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockSelect).toHaveBeenCalledWith(mockTask.id);
  });
});
```

**Skip testing**: Pure display components, third-party wrappers, animations

---

## 10. API Response Handling

```tsx
// Always destructure and check succeeded
const handleCreate = async (data: CreateTaskDto) => {
  try {
    const res = await taskService.create(data);
    if (res.data.succeeded) {
      // success path
      toast.success('Task created!');
      onSuccess(res.data.data!);
    } else {
      toast.error(res.data.message ?? 'Failed to create task');
    }
  } catch (err) {
    // Network/server error
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.message ?? 'Server error';
      toast.error(msg);
    }
  }
};
```

---

## 11. Backend Business Rules to Know

### Task Status Machine
```
PENDING → IN_PROGRESS (via Time Tracking START)
IN_PROGRESS → PAUSED (via Time Tracking PAUSE)
PAUSED → IN_PROGRESS (via Time Tracking RESUME)
IN_PROGRESS/PAUSED → COMPLETED (via Time Tracking STOP)
Any → CANCELLED (Manager/Admin only)
```

### Key Constraints
- **1 session RUNNING per user** across all tasks — nếu có active session, phải STOP trước khi START task khác
- **Survey**: 1 lần/tháng — kiểm tra `GET /api/survey/status` trước khi cho phép submit
- **StandardTime**: Không có update — version mới sẽ deactivate version cũ
- **Comment**: Không có edit/delete — immutable audit trail

### Efficiency Labels (FE display)
| EfficiencyRatio | Label | Color |
|----------------|-------|-------|
| ≥ 1.10 | Xuất sắc | Green |
| ≥ 0.90 | Tốt | Blue |
| ≥ 0.70 | Đạt | Yellow |
| < 0.70 | Cần cải thiện | Red |
| = 0 | Chưa có dữ liệu | Gray |