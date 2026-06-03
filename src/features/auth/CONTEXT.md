# Feature: auth

## Purpose
Quản lý xác thực người dùng — login, logout, token storage, role detection, permission gate.  
**KHÔNG phải page** — đây là utilities/context dùng bởi toàn app.

## Files
- `AuthContext.tsx` — Provider + `useAuth()` hook (isAuthenticated, user, role, login, logout, refreshUser)
- `RoleGate.tsx` — Component kiểm tra role, render fallback nếu không đủ quyền
- `usePermission.ts` — Hook kiểm tra role cụ thể (hasRole, isAdmin, isManager, ...)
- `ProtectedRoute.tsx` — Wrapper redirect về login nếu chưa auth
- `UserMenu.tsx` — Dropdown user ở header (avatar, profile, logout)
- `ProfileEditModal.tsx` — Modal sửa firstName/lastName
- `ChangePasswordModal.tsx` — Modal đổi mật khẩu

## Key Patterns

### AuthContext storage keys
```ts
const authTokenKey = "auth_token";      // localStorage
const userEmailKey = "user_email";      // localStorage
const userProfileKey = "user_profile";  // localStorage (JSON UserDto)
```

### useAuth() returns
```ts
{
  isAuthenticated: boolean,
  userEmail: string | null,
  role: string | null,     // "Admin" | "CEO" | "Manager" | "HR" | "Employee"
  user: UserDto | null,
  login: (email, token) => Promise<void>,   // fetches profile + starts SignalR
  logout: () => void,
  refreshUser: () => Promise<void>
}
```

### RoleGate usage
```tsx
<RoleGate allowedRoles={["Admin", "Manager"]} fallback={<NotAuthorized />}>
  <AdminPanel />
</RoleGate>
```

## API Endpoints Used
- `GET /users/me` → UserDto (called in refreshUser after login)
- `GET /alerts/count` → AlertCountDto (badge count on login)
- `GET /notifications` → NotificationDto[] (initial list on login)

## SignalR
- Kết nối SignalR NGAY SAU KHI login thành công (trong AuthContext useEffect)
- Dùng `src/lib/signalr.ts` — `createSignalRConnection`, `startConnection`
- Disconnect khi logout

## Roles
| Role | Value |
|------|-------|
| Admin | `"Admin"` |
| CEO | `"CEO"` |
| Manager | `"Manager"` |
| HR | `"HR"` |
| Employee | `"Employee"` |

## Important
- Token decode dùng `getRoleFromJwt()` từ `@/lib/api`
- Đừng tạo thêm axios instance — dùng `apiClient` từ `@/lib/api`
- SignalR tự khởi động khi `isAuthenticated` = true
