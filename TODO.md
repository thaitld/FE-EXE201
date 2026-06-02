- [x] Update Login page UI (glow card, modern spacing/typography)
- [x] Add password visibility toggle (eye icon)
- [x] Add loading/disabled state on mock submit
- [x] Improve button styles + focus/hover interactions
- [x] Run quick check: `npm run dev` and verify /login layout

## ✅ FE Structure Refactoring - COMPLETED

**Summary**: Reorganized `src/` to follow feature-folder pattern for better maintainability.

**Features Moved**:

- ✅ **Notifications** (`src/features/notifications/`): notificationStore, notify helper, NotificationsPanel, AlertBell components
- ✅ **Time Tracking** (`src/features/time-tracking/`): useTimeTracking hook, TimeTracker component
- ✅ **Tasks** (`src/features/tasks/`): TaskSubmitModal, CommentThread components, useTaskDetail, useMyTasks hooks
- ✅ **Dashboard** (`src/features/dashboard/`): EfficiencyChart component, usePersonalDashboard hook

**Backward Compatibility**:

- All original import paths still work via re-export wrappers
- `src/components/` and `src/hooks/` have 2-line re-export shims
- Consumer code can migrate imports gradually without breaking changes

**Validation**:

- ✅ Tests: 2/2 passing (`npx vitest run`)
- ✅ TypeScript: Clean compilation (`npx tsc --noEmit`)
- ✅ No breaking changes to existing imports
