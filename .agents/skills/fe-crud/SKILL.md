---
name: fe-crud
description: >
  Generate CRUD for a frontend feature. Creates pages, components, hooks,
  services, and types following MANTO EXE project conventions.
  Use when user says "create crud", "add feature", "generate pages",
  "tạo crud", or wants to add new frontend feature.
argument-hint: "[feature-name]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Generate Frontend CRUD — MANTO EXE

**Scope:** Creates complete CRUD UI for one feature in the MANTO EXE project.

## Pre-flight Checks

1. **Argument provided?** Feature name required (e.g., `tasks`, `survey`, `notifications`)
2. **Project initialized?** Check `src/features/` folder exists
   - If not → Error: "Cannot find src/features/. Are you in the right project?"
3. **Feature already exists?** Check `src/features/{feature-name}/`
   - If exists → Ask: "Feature exists. Add to it or overwrite?"

---

## Required Reading (READ FIRST)

| Doc | What to look for |
|-----|------------------|
| `docs/FE-PROJECT-RULES.md` | Coding patterns, service pattern, state rules |
| `docs/FE-ARCHITECTURE.md` | Folder structure, routing, API layer |
| Backend API Guide | `d:\StudySpace\EXE\MANTO_EXE\MANTO_EXE\docs\frontend-integration-guide.md` — endpoint DTOs |
| Backend Flow | `d:\StudySpace\EXE\MANTO_EXE\MANTO_EXE\Luồng đi toàn bộ dự án.md` — business rules |

---

## Workflow

### Step 1: Gather Information

Ask user (if not clear from context):
- Feature name: `tasks`, `survey`, `admin-users`, `departments`, `kpi`
- Which backend module? (cross-reference with frontend-integration-guide.md)
- Which pages/components needed? (list, detail, create, edit)
- Which roles can access? (Admin / CEO / Manager / HR / Employee)
- Any special UI requirements? (charts, modals, SignalR?)

### Step 2: Read Backend Contract

Before writing code, READ the frontend-integration-guide.md for:
- Request/Response DTOs
- Query params
- Auth requirements
- Business rules & constraints

### Step 3: Check Existing Code

- Read existing features in `src/features/` for patterns
- Check `src/lib/axios.ts` for axios instance
- Check `src/types/` for shared types (ApiResponse, PagedResult)
- Check `src/components/ui/` for reusable components
- Follow the same patterns exactly

### Step 4: Summary & Confirmation (REQUIRED — do NOT skip)

Before writing any file, present the full plan and **wait for user confirmation**.

Output format:
```
📋 Plan for feature "{feature-name}"

📁 Files to be CREATED:
- src/features/{feature-name}/index.ts
- src/features/{feature-name}/types/{feature}.types.ts
- src/features/{feature-name}/services/{feature}.service.ts
- src/features/{feature-name}/hooks/use{Feature}s.ts
- src/features/{feature-name}/hooks/use{Feature}Detail.ts
- src/features/{feature-name}/components/{Feature}List.tsx
- src/features/{feature-name}/components/{Feature}Card.tsx
- src/features/{feature-name}/components/{Feature}Form.tsx     (if applicable)
- src/features/{feature-name}/components/{Feature}Detail.tsx   (if applicable)
- src/features/{feature-name}/pages/{Feature}ListPage.tsx      (if needed)
- src/features/{feature-name}/CONTEXT.md

📝 Files to be UPDATED:
- src/router/AppRouter.tsx   → add hash route
- src/pages/Dashboard.tsx    → add tab entry (if dashboard tab)

⚠️  {N} files will be created, {M} files will be updated.

API endpoints to be consumed:
- GET /api/{resource}
- POST /api/{resource}
- ...

Proceed? (yes / no / adjust)
```

**Rules:**
- Do NOT create or edit any file before the user replies "yes" (or equivalent affirmative)
- If user says "no" → stop and ask what to change
- If user says "adjust" / requests changes → update the plan and show it again
- Only after explicit approval → proceed to Step 5

### Step 5: Generate Files

Create in order:

```
src/features/{feature-name}/
├── index.ts                            # Barrel exports
├── CONTEXT.md                          # Feature context doc
├── types/
│   └── {feature}.types.ts             # TypeScript DTOs from API
├── services/
│   └── {feature}.service.ts           # API calls via axiosInstance
├── hooks/
│   ├── use{Feature}s.ts               # List data hook
│   └── use{Feature}.ts                # Single item hook
├── components/
│   ├── {Feature}List.tsx              # List/table component
│   ├── {Feature}Card.tsx              # Card item (if list-based)
│   ├── {Feature}Form.tsx              # Create/Edit form (if applicable)
│   └── {Feature}Detail.tsx            # Detail view (if applicable)
└── pages/                             # (only if standalone page, not dashboard tab)
    └── {Feature}ListPage.tsx
```

### Step 6: Implement Each Layer

**Types:** Match frontend-integration-guide.md DTOs exactly
```typescript
// Match API response shape
interface TaskDto {
  id: number;
  taskCode: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  assignedUserId: string;  // Guid
  assignedUserName: string;
  // ... from integration guide
}
```

**Service:** Use shared axiosInstance + ApiResponse wrapper
```typescript
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
```

**Hooks:** useState + useEffect wrappers (NO TanStack Query)
```typescript
export function useTasks(params?: TaskFilter) {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await taskService.getMyTasks();
      if (res.data.succeeded) setTasks(res.data.data ?? []);
      else setError(res.data.message);
    } catch (err) {
      setError('Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return { tasks, isLoading, error, refetch: fetchTasks };
}
```

**Components:** Reusable UI pieces
- Use shared components from `src/components/ui/`
- Use Tailwind CSS for styling
- Handle: loading state, error state, empty state, success state
- Use `RoleGate` for role-based visibility

**Pages / Panels:** Connect everything
- Use hooks for data
- Handle hash routing params if needed
- Minimal logic (delegate to components)

### Step 7: Add Routes

If standalone page → Update `src/router/AppRouter.tsx`:
- Add hash route check (e.g., `#/tasks`)
- Add component render

If dashboard tab → Update `src/pages/Dashboard.tsx`:
- Add tab entry
- Add panel component mapping

---

## CONTEXT.md Template

```markdown
# Feature: {feature-name}

## Purpose
{Short description of what this feature does}

## Backend Module
{Which module in frontend-integration-guide.md}

## Key API Endpoints
- GET /api/{resource} — {description}
- POST /api/{resource} — {description}

## Roles That Can Access
- {Role1}: {what they can do}
- {Role2}: {what they can do}

## Business Rules
- {Rule 1 from backend docs}
- {Rule 2}

## State
- {What state this feature manages}

## Components
- {Feature}List — {purpose}
- {Feature}Card — {purpose}
```

---

## Output

```
✅ Feature "{feature-name}" created!

📁 Files created:
- src/features/{feature-name}/
  ├── index.ts
  ├── CONTEXT.md
  ├── types/{feature}.types.ts
  ├── services/{feature}.service.ts
  ├── hooks/use{Feature}s.ts
  └── components/
      ├── {Feature}List.tsx
      └── {Feature}Card.tsx

📝 Updated:
- src/router/AppRouter.tsx (added hash route)

🚀 Next steps:
1. Review generated code
2. Run `npm run dev` to verify
3. Navigate to #{feature} to test
4. Run `/fe-test {feature}` to generate tests
```

---

## Important Rules

1. **NEVER use TanStack Query** — use useState + service calls
2. **Hash routing** — NOT React Router navigate()
3. **Follow existing patterns** — read other features first
4. **Match frontend-integration-guide.md** — Types match API response exactly
5. **Use shared axiosInstance** — NEVER create new axios instances
6. **Check roles** — wrap with RoleGate where needed
7. **Use shared components** — don't reinvent Button, Input, Modal
8. **Handle ALL states** — Loading, error, empty, success
9. **No `any` types** — Proper TypeScript types

## Error Handling

| Error | Action |
|-------|--------|
| Missing feature name | Ask: "Which feature? e.g., `/fe-crud tasks`" |
| frontend-integration-guide.md not found | Use backend Luồng doc instead |
| Feature already exists | Ask: "Overwrite or add to existing?" |
| Backend endpoint unclear | Ask user for clarification |
