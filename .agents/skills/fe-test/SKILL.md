---
name: fe-test
description: >
  Generate tests for frontend feature. Creates component tests, hook tests,
  and service tests following MANTO EXE project conventions.
  Use when user says "write test", "add tests", "test feature",
  "viết test", or wants to add tests for frontend feature.
argument-hint: "[feature-name]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Generate Frontend Tests — MANTO EXE

**Scope:** Creates component tests + hook tests + service tests for one feature.

**Testing Stack:** Vitest + React Testing Library (already in package.json)

## Pre-flight Checks

1. **Argument provided?** Feature name required (e.g., `tasks`, `auth`, `survey`)
2. **Feature exists?** Check `src/features/{feature-name}/`
   - If not → Error: "Feature not found. Run `/fe-crud {feature}` first"
3. **Tests already exist?** Check for `.test.tsx` / `.test.ts` files
   - If exists → Ask: "Tests exist. Add more or overwrite?"

---

## Required Reading (READ FIRST)

| Doc | What to look for |
|-----|------------------|
| `docs/FE-PROJECT-RULES.md` | Testing patterns, what to test |
| `src/features/{feature-name}/` | All files to understand what to test |
| `src/features/{feature-name}/CONTEXT.md` | Feature context, business rules |

---

## Workflow

### Step 1: Analyze Feature

Read and understand:
- `services/*.service.ts` — API calls to mock
- `hooks/use*.ts` — Hooks to test
- `components/*.tsx` — UI to test (user interactions)
- `CONTEXT.md` — Business rules to verify

### Step 2: Summary & Confirmation (REQUIRED — do NOT skip)

Before writing any file, present the full plan and **wait for user confirmation**.

Output format:
```
📋 Test plan for feature "{feature-name}"

📁 Files to be CREATED:
- src/features/{feature-name}/services/{feature}.service.test.ts
- src/features/{feature-name}/hooks/use{Feature}s.test.ts
- src/features/{feature-name}/components/{Feature}List.test.tsx
- src/features/{feature-name}/components/{Feature}Form.test.tsx  (if applicable)

⚠️  {N} test files will be created.

Proceed? (yes / no / adjust)
```

**Rules:**
- Do NOT create or edit any file before the user replies "yes" (or equivalent affirmative)
- If user says "no" → stop and ask what to change
- If user says "adjust" → update the plan and show it again
- Only after explicit approval → proceed to Step 3

### Step 3: Generate Test Files

```
src/features/{feature-name}/
├── services/
│   └── {feature}.service.test.ts       # Service/API call tests
├── hooks/
│   ├── use{Feature}s.test.ts           # List hook test
│   └── use{Feature}.test.ts            # Single item hook test
└── components/
    ├── {Feature}List.test.tsx          # List component test
    ├── {Feature}Form.test.tsx          # Form component test (if applicable)
    └── {Feature}Card.test.tsx          # Card component test (if applicable)
```

### Step 4: Write Service Tests

Mock axios to test service calls:

```typescript
// task.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/lib/axios';
import { taskService } from './task.service';

vi.mock('@/lib/axios');
const mockedAxios = vi.mocked(axiosInstance);

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call GET /api/tasks/my', async () => {
    const mockData = { succeeded: true, data: [], message: null };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await taskService.getMyTasks();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/tasks/my');
    expect(result.data.succeeded).toBe(true);
  });

  it('should call POST /api/tasks with correct payload', async () => {
    const mockPayload = { title: 'Test task', taskTypeId: 1 };
    const mockResponse = { succeeded: true, data: { id: 1, ...mockPayload }, message: null };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    await taskService.create(mockPayload as any);

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/tasks', mockPayload);
  });
});
```

### Step 5: Write Hook Tests

Test useState + useEffect data fetching pattern:

```typescript
// useTasks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';
import { taskService } from '../services/task.service';

vi.mock('../services/task.service');
const mockedTaskService = vi.mocked(taskService);

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    mockedTaskService.getMyTasks.mockResolvedValueOnce({
      data: { succeeded: true, data: [], message: null }
    } as any);

    const { result } = renderHook(() => useTasks());
    expect(result.current.isLoading).toBe(true);
  });

  it('should return data on success', async () => {
    const mockTasks = [{ id: 1, title: 'Task 1', status: 'PENDING' }];
    mockedTaskService.getMyTasks.mockResolvedValueOnce({
      data: { succeeded: true, data: mockTasks, message: null }
    } as any);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  it('should set error on API failure', async () => {
    mockedTaskService.getMyTasks.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).not.toBeNull();
  });
});
```

### Step 6: Write Component Tests

Test user behavior, not implementation:

```typescript
// TaskList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';

// Mock the hook
vi.mock('../hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));
import { useTasks } from '../hooks/useTasks';
const mockedUseTasks = vi.mocked(useTasks);

describe('TaskList', () => {
  it('should render loading state', () => {
    mockedUseTasks.mockReturnValue({
      tasks: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<TaskList onTaskSelect={vi.fn()} />);
    // Check for skeleton/spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    mockedUseTasks.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TaskList onTaskSelect={vi.fn()} />);
    expect(screen.getByText(/không có công việc/i)).toBeInTheDocument();
  });

  it('should render list of tasks', () => {
    mockedUseTasks.mockReturnValue({
      tasks: [
        { id: 1, taskCode: 'TASK-001', title: 'Test Task', status: 'PENDING' },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TaskList onTaskSelect={vi.fn()} />);
    expect(screen.getByText('TASK-001')).toBeInTheDocument();
  });

  it('should call onTaskSelect when task is clicked', async () => {
    const mockSelect = vi.fn();
    mockedUseTasks.mockReturnValue({
      tasks: [{ id: 42, taskCode: 'TASK-042', title: 'Clickable Task', status: 'PENDING' }],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TaskList onTaskSelect={mockSelect} />);
    await userEvent.click(screen.getByText('TASK-042'));
    expect(mockSelect).toHaveBeenCalledWith(42);
  });
});
```

### Step 7: Write Form Tests

```typescript
// TaskForm.test.tsx
describe('TaskForm', () => {
  it('should render all required form fields', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/tiêu đề/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loại công việc/i)).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /tạo/i }));
    expect(await screen.findByText(/bắt buộc/i)).toBeInTheDocument();
  });

  it('should call onSubmit with correct data', async () => {
    const mockSubmit = vi.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    await userEvent.type(screen.getByLabelText(/tiêu đề/i), 'Test Task');
    await userEvent.click(screen.getByRole('button', { name: /tạo/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Task' })
      );
    });
  });

  it('should disable submit button when loading', () => {
    render(<TaskForm onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: /tạo/i })).toBeDisabled();
  });
});
```

---

## Test Coverage Targets

| Layer | Target | Focus |
|-------|--------|-------|
| Services | 90%+ | All API calls, error cases |
| Hooks | 80%+ | Loading/success/error states |
| Components | 75%+ | User interactions, state changes |

---

## Vitest Config (already set up)

```typescript
// vitest.config.ts (existing)
// environment: 'jsdom', globals: true
// Run: npm run test
```

---

## Output

```
✅ Tests for "{feature-name}" created!

📁 Files created:
- src/features/{feature-name}/
  ├── services/{feature}.service.test.ts
  ├── hooks/
  │   └── use{Feature}s.test.ts
  └── components/
      ├── {Feature}List.test.tsx
      └── {Feature}Form.test.tsx   (if applicable)

🧪 Run tests:
- All tests: `npm run test`
- This feature: `npm run test {feature}`
- Watch mode: `npm run test -- --watch`
- Coverage: `npm run test -- --coverage`

📊 Expected coverage: 90%+ services, 80%+ hooks, 75%+ components
```

---

## Important Rules

1. **Test user behavior** — Not implementation details
2. **Use Testing Library queries** — `getByRole`, `getByText`, `getByLabelText` (NOT `getByTestId`)
3. **Mock services in hook tests** — Never make real API calls
4. **Mock hooks in component tests** — Test UI behavior in isolation
5. **Vietnamese text** — App uses Vietnamese UI text, match it in queries
6. **Descriptive names** — "should show error when API fails"
7. **Independent tests** — Each test can run alone, no shared state
8. **Business rules** — Test MANTO-specific rules (e.g., survey 1/month, task state machine)

## Key Business Rules to Test

| Feature | Rule to Test |
|---------|-------------|
| Survey | Cannot submit twice in same month |
| Time Tracking | Cannot have 2 RUNNING sessions simultaneously |
| Tasks | Status transitions follow state machine |
| Auth | Unauthenticated redirects to login |
| RoleGate | Wrong role shows fallback component |

## Error Handling

| Error | Action |
|-------|--------|
| Missing feature name | Ask: "Which feature? e.g., `/fe-test tasks`" |
| Feature not found | Suggest: "Run `/fe-crud {feature}` first" |
| Testing library not installed | Run: `npm install -D @testing-library/react @testing-library/user-event` |
| Vitest not installed | Already in devDependencies — run `npm install` |
