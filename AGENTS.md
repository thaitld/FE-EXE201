# Frontend: MANTO EXE

## Project Overview
Hệ thống quản lý hiệu suất nhân viên (Employee Performance Management) — tích hợp AI Burnout Detection, Time Tracking, Task Management, Dashboard đa vai trò.

## Tech Stack
  - React 19 + Vite: fast dev server, modern React features
  - TypeScript: type safety, better DX, catch errors early
  - Zustand: global state (auth user info)
  - TanStack Query: **KHÔNG dùng** — dùng Axios trực tiếp trong features
  - Tailwind CSS: utility-first, fast styling, consistent design
  - Axios: HTTP client với interceptors (JWT Bearer auto-attach)
  - React Router: hash-based routing (`#/route`)
  - SignalR (@microsoft/signalr): real-time notifications
  - Recharts: biểu đồ performance, KPI trend
  - Motion/GSAP: animations
  - Lucide React: icon library

## Backend
  - ASP.NET Core 8 · EF Core · SQL Server · SignalR
  - Base URL: `http://localhost:5211` (dev) / `https://{domain}` (prod)
  - Auth: JWT Bearer (12h) · Google OAuth2
  - Swagger: `http://localhost:5211/swagger`

## Documentation

### Key Documentation

| File | Mục đích |
|------|---------|
| `docs/FE-ARCHITECTURE.md` | Folder structure, routing, data flow |
| `docs/FE-PROJECT-RULES.md` | Coding patterns, service pattern, anti-patterns |
| `docs/DESIGN.md` | **Design system** — màu sắc, component patterns, typography |
| `d:\StudySpace\EXE\MANTO_EXE\MANTO_EXE\docs\frontend-integration-guide.md` | API endpoints & DTOs |
| `d:\StudySpace\EXE\MANTO_EXE\MANTO_EXE\Luồng đi toàn bộ dự án.md` | Business rules & flows |

## Quick Reference

### Routing (Hash-based)
```
#/               → Homepage / redirect to dashboard
#/login          → Login page
#/forgot-password → Forgot password
#/reset-password  → Reset password
#/change-password → Change password (auth required)
#/survey          → Monthly survey (auth required)
#/admin/*         → Dashboard (role-based tabs)
/auth/callback    → Google OAuth2 callback (pathname-based)
```

### Roles
`Admin` | `CEO` | `Manager` | `HR` | `Employee`

### Feature Location
`src/features/[name]/` - Each feature self-contained

### Public Exports
Always via `index` file (barrel export)

### Key API Conventions
- All responses: `ApiResponse<T>` → `{ succeeded, message, data }`
- Paginated: `PagedResult<T>` → `{ items, totalCount, pageNumber, pageSize, totalPages }`
- Auth header: `Authorization: Bearer {token}`

### Key Files
- **HTTP Client**: `src/lib/api.ts` — `apiClient` + all API functions + shared types
- **SignalR**: `src/lib/signalr.ts` — managed in `AuthContext`, do NOT create new connections
- **Router**: `src/router/AppRouter.tsx` — hash-based routing

---

## AI Agent Workflow

### Đọc trước khi code (theo thứ tự)

```
1. AGENTS.md (file này)                    ← Đọc đầu tiên — overview project
2. docs/FE-PROJECT-RULES.md               ← Patterns, anti-patterns, rules
3. docs/FE-ARCHITECTURE.md               ← Folder structure, routing, data flow
4. docs/DESIGN.md                        ← Design system (BẮT BUỘC cho mọi UI task)
5. src/features/{feature}/CONTEXT.md     ← Context của feature đang làm
6. src/lib/CONTEXT.md                    ← Nếu cần thêm API call
```

### CONTEXT.md Files (per feature)

Mỗi feature folder có `CONTEXT.md` giải thích:
- Purpose và business rules
- Files hiện có
- API endpoints đang dùng
- Types và patterns quan trọng

| File | Nội dung |
|------|---------|
| `src/features/auth/CONTEXT.md` | useAuth, RoleGate, token storage |
| `src/features/tasks/CONTEXT.md` | Task state machine, comments |
| `src/features/time-tracking/CONTEXT.md` | Timer, session rules |
| `src/features/notifications/CONTEXT.md` | SignalR, Zustand store |
| `src/features/dashboard/CONTEXT.md` | Dashboard per role, charts |
| `src/features/survey/CONTEXT.md` | Survey 1/tháng constraint |
| `src/lib/CONTEXT.md` | apiClient, all API functions |

### Khi bắt đầu task mới

1. Đọc CONTEXT.md của feature liên quan
2. Xem code hiện có trong folder đó
3. Follow đúng patterns (không tự sáng tạo)
4. KHÔNG tạo axios instance mới — dùng `apiClient` từ `@/lib/api`
5. KHÔNG dùng TanStack Query — dùng `useState + useEffect`
