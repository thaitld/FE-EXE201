import axios from "axios";
import type {
  DailyPerformanceDto,
  TaskInstanceSummaryDto,
  DailyEfficiencyPointDto,
  PersonalBurnoutInsightDto,
  PersonalDashboardDto,
  TaskInstanceDto,
  TaskCommentDto,
  TaskAttachmentDto,
  TimeTrackingSessionDto,
  TimeTrackingStartResponseDto,
  TimeTrackingStopResponseDto,
  SurveyStatusDto,
  SurveyHistoryDto,
  BehavioralPatternDto,
  NotificationDto,
  TaskFilterParams,
} from "@/types/employee";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5211/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extract role from JWT token
 * JWT format: header.payload.signature
 * Payload is base64url encoded JSON containing role claim
 */
export function getRoleFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode payload (add padding if needed)
    const payload = parts[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));

    // Role can be in different claims
    return (
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null
    );
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T | null;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface DepartmentKpiSummaryDto {
  departmentId: number;
  departmentName: string;
  avgEfficiencyRatio: number;
  avgEfficiencyLabel: string;
  avgMoraleScore: number;
  headCount: number;
  highRiskBurnoutCount: number;
}

export interface BurnoutOverviewDto {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  resolved: number;
}

export interface MonthlyKpiPointDto {
  year: number;
  month: number;
  avgEfficiency: number;
  avgMorale: number;
  avgStress: number;
}

export interface AlertCountDto {
  unread: number;
  high: number;
  medium: number;
  low: number;
}

export interface AlertSummaryDto {
  id: number;
  alertType: string;
  message: string;
  severity: string;
  createdAt: string | null;
}

export interface CompanyDashboardDto {
  year: number;
  month: number;
  avgEfficiencyRatio: number;
  avgEfficiencyLabel: string;
  avgMoraleScore: number;
  avgStressScore: number;
  totalActiveEmployees: number;
  departments: DepartmentKpiSummaryDto[];
  burnoutOverview: BurnoutOverviewDto;
  quarterlyTrend: MonthlyKpiPointDto[];
  systemAlerts: AlertSummaryDto[];
  monthlyInsight: string | null;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleName: string;
  teamName: string | null;
  departmentId?: number | null;
  departmentName: string | null;
  roleInTeam: string | null;
  createdAt: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUserFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RoleDto {
  id: number;
  name: string;
  normalizedName: string;
}

export interface TeamDetailDto {
  id: number;
  code: string;
  name: string;
  departmentId: number;
  departmentName: string;
  teamLeadUserId: string | null;
  teamLeadName: string | null;
  shift: string | null;
  isActive: boolean;
  memberCount: number;
}

export interface DepartmentDto {
  id: number;
  name: string;
  managerUserId: string | null;
  managerName: string | null;
  isActive: boolean;
  teamCount: number;
}

export interface CreateDepartmentDto {
  name: string;
  managerUserId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  managerUserId?: string;
  isActive?: boolean;
}

export interface CreateTeamDto {
  code: string;
  name: string;
  departmentId: number;
  teamLeadUserId?: string;
  shift?: string;
}

export interface UpdateTeamDto {
  code?: string;
  name?: string;
  departmentId?: number;
  teamLeadUserId?: string;
  shift?: string;
  isActive?: boolean;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  teamId?: number;
  roleInTeam?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface AiExecutionLogDto {
  id: number;
  jobName: string;
  executedAt: string | null;
  status: string;
  errorMessage: string | null;
}

export const decodeJwtPayload = (
  token: string,
): Record<string, unknown> | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getEmailFromJwt = (token: string): string | null => {
  const payload = decodeJwtPayload(token);
  const email = payload?.email;

  return typeof email === "string" && email.trim().length > 0 ? email : null;
};

// ============================================================================
// Phase 3: Employee/Staff Workflow API Endpoints
// ============================================================================

/**
 * Personal Dashboard: GET /api/dashboard/personal
 */
export const getPersonalDashboard = () =>
  apiClient.get<ApiResponse<PersonalDashboardDto>>("/dashboard/personal");

/**
 * My Tasks: GET /api/tasks/my
 * Fetch tasks assigned to current user
 */
export const getMyTasks = (params?: TaskFilterParams) =>
  apiClient.get<ApiResponse<TaskInstanceDto[]>>("/tasks/my", { params });

/**
 * Get paginated tasks with filtering
 * GET /api/tasks?page=1&pageSize=20&status=PENDING
 */
export const getTasks = (params?: TaskFilterParams) =>
  apiClient.get<
    ApiResponse<{
      items: TaskInstanceDto[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    }>
  >("/tasks", { params });

/**
 * Get single task details
 * GET /api/tasks/{id}
 */
export const getTaskDetail = (taskId: number) =>
  apiClient.get<ApiResponse<TaskInstanceDto>>(`/tasks/${taskId}`);

/**
 * Update task status (for submission)
 * PATCH /api/tasks/{id}/status
 */
export const updateTaskStatus = (
  taskId: number,
  data: {
    status: string;
    submissionNote?: string;
    deliverableUrl?: string;
    rejectionReason?: string;
  },
) =>
  apiClient.patch<ApiResponse<TaskInstanceDto>>(
    `/tasks/${taskId}/status`,
    data,
  );

/**
 * Get task comments
 * GET /api/tasks/{taskId}/comments
 */
export const getTaskComments = (taskId: number) =>
  apiClient.get<ApiResponse<TaskCommentDto[]>>(`/tasks/${taskId}/comments`);

/**
 * Add comment to task
 * POST /api/tasks/{taskId}/comments
 */
export const addTaskComment = (taskId: number, content: string) =>
  apiClient.post<ApiResponse<TaskCommentDto>>(`/tasks/${taskId}/comments`, {
    content,
  });

/**
 * Get task attachments
 * GET /api/tasks/{taskId}/attachments
 */
export const getTaskAttachments = (taskId: number) =>
  apiClient.get<ApiResponse<TaskAttachmentDto[]>>(
    `/tasks/${taskId}/attachments`,
  );

/**
 * Upload submission attachment
 * POST /api/tasks/{taskId}/attachments/submission
 */
export const uploadSubmissionAttachment = (taskId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<TaskAttachmentDto>>(
    `/tasks/${taskId}/attachments/submission`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

/**
 * Delete attachment
 * DELETE /api/tasks/{taskId}/attachments/{id}
 */
export const deleteAttachment = (taskId: number, attachmentId: number) =>
  apiClient.delete<ApiResponse<void>>(
    `/tasks/${taskId}/attachments/${attachmentId}`,
  );

/**
 * Time Tracking: Start timer
 * POST /api/tasks/{taskId}/time/start
 */
export const startTimeTracking = (taskId: number) =>
  apiClient.post<ApiResponse<TimeTrackingStartResponseDto>>(
    `/tasks/${taskId}/time/start`,
    {},
  );

/**
 * Time Tracking: Pause timer
 * POST /api/tasks/{taskId}/time/pause
 */
export const pauseTimeTracking = (taskId: number, sessionId: string) =>
  apiClient.post<
    ApiResponse<{
      sessionId: string;
      action: string;
      timestamp: string;
      taskStatus: string;
    }>
  >(`/tasks/${taskId}/time/pause`, {
    sessionId,
  });

/**
 * Time Tracking: Resume timer
 * POST /api/tasks/{taskId}/time/resume
 */
export const resumeTimeTracking = (taskId: number, sessionId: string) =>
  apiClient.post<
    ApiResponse<{
      sessionId: string;
      action: string;
      timestamp: string;
      taskStatus: string;
    }>
  >(`/tasks/${taskId}/time/resume`, {
    sessionId,
  });

/**
 * Time Tracking: Stop timer
 * POST /api/tasks/{taskId}/time/stop
 */
export const stopTimeTracking = (
  taskId: number,
  sessionId: string,
  note?: string,
) =>
  apiClient.post<ApiResponse<TimeTrackingStopResponseDto>>(
    `/tasks/${taskId}/time/stop`,
    {
      sessionId,
      note,
    },
  );

/**
 * Get active time tracking session
 * GET /api/tasks/time/active
 */
export const getActiveTimeSession = () =>
  apiClient.get<ApiResponse<TimeTrackingSessionDto | null>>(
    "/tasks/time/active",
  );

/**
 * Survey: Get survey status
 * GET /api/survey/status
 */
export const getSurveyStatus = () =>
  apiClient.get<ApiResponse<SurveyStatusDto>>("/survey/status");

/**
 * Survey: Submit survey
 * POST /api/survey
 */
export const submitSurvey = (data: {
  moraleScore: number;
  stressScore: number;
  comment?: string;
}) => apiClient.post<ApiResponse<void>>("/survey", data);

/**
 * Survey: Get history
 * GET /api/survey/history
 */
export const getSurveyHistory = () =>
  apiClient.get<ApiResponse<SurveyHistoryDto>>("/survey/history");

/**
 * Burnout: Get personal burnout signals
 * GET /api/burnout/signals/me
 */
export const getPersonalBurnoutSignals = () =>
  apiClient.get<ApiResponse<PersonalBurnoutInsightDto | null>>(
    "/burnout/signals/me",
  );

/**
 * Burnout: Get behavioral patterns
 * GET /api/burnout/patterns/me
 */
export const getPersonalBehavioralPatterns = () =>
  apiClient.get<ApiResponse<BehavioralPatternDto[]>>("/burnout/patterns/me");

/**
 * Notifications: Get notifications
 * GET /api/notifications?unreadOnly=true&limit=30
 */
export const getNotifications = (params?: {
  unreadOnly?: boolean;
  limit?: number;
}) =>
  apiClient.get<ApiResponse<NotificationDto[]>>("/notifications", { params });

/**
 * Notifications: Mark as read
 * PATCH /api/notifications/{id}/read
 */
export const markNotificationAsRead = (notificationId: number) =>
  apiClient.patch<ApiResponse<void>>(
    `/notifications/${notificationId}/read`,
    {},
  );

/**
 * Notifications: Mark all as read
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = () =>
  apiClient.patch<ApiResponse<void>>("/notifications/read-all", {});

// ============================================================================
// Phase 4: Manager Tools API
// ============================================================================

// ── Types ──────────────────────────────────────────────────────────────────

export interface TeamPerformanceSummaryDto {
  teamId: number;
  teamName: string;
  avgEfficiencyRatio: number;
  avgEfficiencyLabel: string;
  memberCount: number;
  pendingTasks: number;
  members: null;
}

export interface BurnoutAlertItemDto {
  signalId: number;
  userName: string;
  riskScore: number;
  riskLevel: string;
  detectedDate: string;
}

export interface DailyEfficiencyPointDto2 {
  date: string;
  efficiencyRatio: number | null;
  efficiencyLabel: string;
}

export interface DepartmentDashboardDto {
  departmentId: number;
  departmentName: string;
  year: number;
  month: number;
  avgEfficiencyRatio: number;
  avgEfficiencyLabel: string;
  avgMoraleScore: number;
  avgStressScore: number;
  totalActiveTasks: number;
  overdueTasks: number;
  completedThisMonth: number;
  teams: TeamPerformanceSummaryDto[];
  highRiskBurnoutCount: number;
  mediumRiskBurnoutCount: number;
  recentHighRiskAlerts: BurnoutAlertItemDto[];
  monthlyTrend: DailyEfficiencyPointDto2[];
  unreadAlerts: AlertSummaryDto[];
}

export interface BurnoutSignalDto {
  id: number;
  userId: string;
  userName: string;
  department: string | null;
  team: string | null;
  riskScore: number;
  riskLevel: string;
  triggerFactors: string[];
  detectedDate: string;
  isResolved: boolean;
  createdAt: string;
}

export interface ResolveBurnoutDto {
  resolutionNote: string;
}

export interface TeamMemberPerformanceDto {
  userId: string;
  userName: string;
  efficiencyRatio: number;
  efficiencyLabel: string;
  totalTasks: number;
}

export interface TeamPerformanceDto {
  teamId: number;
  teamName: string;
  reportDate: string;
  avgEfficiencyRatio: number;
  avgEfficiencyLabel: string;
  totalMembers: number;
  activeMembers: number;
  members: TeamMemberPerformanceDto[];
}

export interface OvertimeReportDto {
  userId: string;
  userName: string;
  reportDate: string;
  workEnd: string;
  actualLastActivity: string | null;
  overtimeMinutes: number;
  hasOvertime: boolean;
}

export interface WorkScheduleDto {
  id: number;
  teamId: number;
  teamName: string;
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
  standardMinutesPerDay: number;
  shiftLabel: string;
}

export interface UpdateWorkScheduleDto {
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

export interface StandardTimeDto {
  id: number;
  taskTypeId: number;
  taskTypeCode: string;
  taskTypeName: string;
  observedTime: number;
  ratingFactor: number;
  pfdFactor: number;
  standardTime: number | null;
  version: number;
  isActive: boolean;
  createdAt?: string;
}

export interface TaskTypeDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: string | null;
  isActive: boolean;
  hasActiveStandardTime: boolean;
  currentStandardTime: number | null;
  createdAt?: string;
  requiresApproval?: boolean;
}

export interface CreateTaskInstanceDto {
  taskTypeId: number;
  title: string;
  assignedUserId: string;
  plannedQuantity?: number;
  expectedCompletion: string;
  priority?: string;
}

export interface BulkCreateTaskInstanceDto {
  tasks: CreateTaskInstanceDto[];
}

export interface BulkCreateResultDto {
  successCount: number;
  failCount: number;
  errors: { index: number; field: string; message: string }[];
  createdIds: number[];
}

export interface UpdateTaskInstanceDto {
  title?: string;
  expectedCompletion?: string;
  plannedQuantity?: number;
}

export interface ReassignTaskDto {
  newAssignedUserId: string;
  reason?: string;
}

export interface CloneTaskDto {
  title?: string;
  assignedUserId?: string;
  expectedCompletion?: string;
  priority?: string;
}

export interface BulkUpdateStatusDto {
  taskIds: number[];
  status: string;
  rejectionReason?: string;
}

export interface BulkUpdateStatusResultDto {
  successCount: number;
  failCount: number;
  errors: { taskId: number; message: string }[];
}

export interface AssigneeSuggestionMetrics {
  activeTaskCount: number;
  avgEfficiencyRatio: number | null;
  overtimeDaysThisWeek: number;
  burnoutRiskLevel: string;
  taskTypeExperienceCount: number;
}

export interface AssigneeSuggestionDto {
  userId: string;
  userName: string;
  rank: number;
  fitScore: number;
  fitLabel: string;
  reasoning: string;
  metrics: AssigneeSuggestionMetrics;
}

export interface TeamMemberDto {
  userId: string;
  userName: string;
  email: string;
  roleInTeam: string;
  joinedAt: string | null;
}

export interface AddTeamMemberDto {
  userId: string;
  roleInTeam?: string;
}

export interface UpdateTeamMemberDto {
  roleInTeam: string;
}

export interface ManagerReportDto {
  departmentId: number;
  departmentName: string;
  weekStart: string;
  weekEnd: string;
  aiReport: string;
  generatedAt: string;
}

export interface SurveyAggregationDto {
  avgMoraleScore: number;
  avgStressScore: number;
  responseCount: number;
  responseRate: number;
}

export interface SurveyResponseRateDto {
  submittedCount: number;
  notSubmittedCount: number;
  responseRate: number;
  notSubmittedUsers: { userId: string; userName: string }[];
}

export interface TaskFilterManagerParams {
  status?: string;
  priority?: string;
  teamId?: number;
  page?: number;
  pageSize?: number;
  assignedUserId?: string;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

/**
 * Department Dashboard KPI
 * GET /api/dashboard/department/{deptId}?year=&month=
 */
export const getDepartmentDashboard = (
  deptId: number,
  year?: number,
  month?: number,
) =>
  apiClient.get<ApiResponse<DepartmentDashboardDto>>(
    `/dashboard/department/${deptId}`,
    { params: { year, month } },
  );

// ── Tasks (Manager) ────────────────────────────────────────────────────────

/**
 * Get all tasks (Manager sees own dept)
 * GET /api/tasks?status=&priority=&teamId=&page=1&pageSize=20
 */
export const getManagerTasks = (params?: TaskFilterManagerParams) =>
  apiClient.get<ApiResponse<PagedResult<import("@/types/employee").TaskInstanceDto>>>(
    "/tasks",
    { params },
  );

/**
 * Get tasks of a specific team
 * GET /api/tasks/team/{teamId}
 */
export const getTeamTasks = (teamId: number) =>
  apiClient.get<ApiResponse<import("@/types/employee").TaskInstanceDto[]>>(
    `/tasks/team/${teamId}`,
  );

/**
 * Create task
 * POST /api/tasks
 */
export const createTask = (dto: CreateTaskInstanceDto) =>
  apiClient.post<ApiResponse<import("@/types/employee").TaskInstanceDto>>(
    "/tasks",
    dto,
  );

/**
 * Bulk create tasks (max 50)
 * POST /api/tasks/bulk
 */
export const bulkCreateTasks = (dto: BulkCreateTaskInstanceDto) =>
  apiClient.post<ApiResponse<BulkCreateResultDto>>("/tasks/bulk", dto);

/**
 * Update task info
 * PUT /api/tasks/{id}
 */
export const updateTask = (id: number, dto: UpdateTaskInstanceDto) =>
  apiClient.put<ApiResponse<import("@/types/employee").TaskInstanceDto>>(
    `/tasks/${id}`,
    dto,
  );

/**
 * Reassign task
 * PATCH /api/tasks/{id}/reassign
 */
export const reassignTask = (id: number, dto: ReassignTaskDto) =>
  apiClient.patch<ApiResponse<null>>(`/tasks/${id}/reassign`, dto);

/**
 * Clone task
 * POST /api/tasks/{id}/clone
 */
export const cloneTask = (id: number, dto: CloneTaskDto) =>
  apiClient.post<ApiResponse<import("@/types/employee").TaskInstanceDto>>(
    `/tasks/${id}/clone`,
    dto,
  );

/**
 * Bulk update status (approve/reject/cancel)
 * PATCH /api/tasks/bulk-status
 */
export const bulkUpdateTaskStatus = (dto: BulkUpdateStatusDto) =>
  apiClient.patch<ApiResponse<BulkUpdateStatusResultDto>>(
    "/tasks/bulk-status",
    dto,
  );

/**
 * AI suggest assignee
 * GET /api/tasks/suggest-assignee?taskTypeId=&teamId=
 */
export const suggestAssignee = (taskTypeId: number, teamId?: number) =>
  apiClient.get<ApiResponse<AssigneeSuggestionDto[]>>(
    "/tasks/suggest-assignee",
    { params: { taskTypeId, teamId } },
  );

// ── Task Types ─────────────────────────────────────────────────────────────

/**
 * Get task types
 * GET /api/task-types?isActive=true
 */
export const getTaskTypes = (isActive?: boolean) =>
  apiClient.get<ApiResponse<TaskTypeDto[]>>("/task-types", {
    params: { isActive },
  });

/**
 * Get active standard time for task type
 * GET /api/task-types/{id}/standard-times/active
 */
export const getActiveStandardTime = (taskTypeId: number) =>
  apiClient.get<ApiResponse<StandardTimeDto>>(
    `/task-types/${taskTypeId}/standard-times/active`,
  );

// ── Performance ────────────────────────────────────────────────────────────

/**
 * Team performance for a date
 * GET /api/performance/team/{teamId}?date=
 */
export const getTeamPerformance = (teamId: number, date?: string) =>
  apiClient.get<ApiResponse<TeamPerformanceDto>>(
    `/performance/team/${teamId}`,
    { params: { date } },
  );

/**
 * User performance range
 * GET /api/performance/users/{userId}?from=&to=
 */
export const getUserPerformanceRange = (
  userId: string,
  from: string,
  to: string,
) =>
  apiClient.get<ApiResponse<import("@/types/employee").DailyPerformanceDto[]>>(
    `/performance/users/${userId}`,
    { params: { from, to } },
  );

/**
 * Department performance range
 * GET /api/performance/department/{deptId}?from=&to=
 */
export const getDepartmentPerformanceRange = (
  deptId: number,
  from: string,
  to: string,
) =>
  apiClient.get<ApiResponse<import("@/types/employee").DailyPerformanceDto[]>>(
    `/performance/department/${deptId}`,
    { params: { from, to } },
  );

// ── Burnout (Manager) ──────────────────────────────────────────────────────

/**
 * Get burnout signals (paginated)
 * GET /api/burnout/signals?riskLevel=&isResolved=&deptId=&page=
 */
export const getBurnoutSignals = (params?: {
  riskLevel?: string;
  isResolved?: boolean;
  deptId?: number;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<ApiResponse<PagedResult<BurnoutSignalDto>>>(
    "/burnout/signals",
    { params },
  );

/**
 * Resolve a burnout signal
 * PATCH /api/burnout/signals/{id}/resolve
 */
export const resolveBurnoutSignal = (id: number, dto: ResolveBurnoutDto) =>
  apiClient.patch<ApiResponse<null>>(`/burnout/signals/${id}/resolve`, dto);

/**
 * Burnout patterns for department
 * GET /api/burnout/patterns/department/{deptId}?from=&to=
 */
export const getDeptBurnoutPatterns = (
  deptId: number,
  from?: string,
  to?: string,
) =>
  apiClient.get<ApiResponse<import("@/types/employee").BehavioralPatternDto[]>>(
    `/burnout/patterns/department/${deptId}`,
    { params: { from, to } },
  );

// ── Work Schedule & Overtime ───────────────────────────────────────────────

/**
 * Get team schedule
 * GET /api/teams/{teamId}/schedule
 */
export const getTeamSchedule = (teamId: number) =>
  apiClient.get<ApiResponse<WorkScheduleDto>>(`/teams/${teamId}/schedule`);

/**
 * Upsert team schedule
 * PUT /api/teams/{teamId}/schedule
 */
export const upsertTeamSchedule = (teamId: number, dto: UpdateWorkScheduleDto) =>
  apiClient.put<ApiResponse<WorkScheduleDto>>(`/teams/${teamId}/schedule`, dto);

/**
 * Delete team schedule
 * DELETE /api/teams/{teamId}/schedule
 */
export const deleteTeamSchedule = (teamId: number) =>
  apiClient.delete<ApiResponse<null>>(`/teams/${teamId}/schedule`);

/**
 * Get team overtime report
 * GET /api/teams/{teamId}/overtime?from=&to=
 */
export const getTeamOvertime = (teamId: number, from: string, to: string) =>
  apiClient.get<ApiResponse<OvertimeReportDto[]>>(
    `/teams/${teamId}/overtime`,
    { params: { from, to } },
  );

// ── Team Members ───────────────────────────────────────────────────────────

/**
 * Get team members
 * GET /api/teams/{id}/members
 */
export const getTeamMembers = (teamId: number) =>
  apiClient.get<ApiResponse<TeamMemberDto[]>>(`/teams/${teamId}/members`);

/**
 * Add team member
 * POST /api/teams/{id}/members
 */
export const addTeamMember = (teamId: number, dto: AddTeamMemberDto) =>
  apiClient.post<ApiResponse<TeamMemberDto>>(
    `/teams/${teamId}/members`,
    dto,
  );

/**
 * Update team member role
 * PATCH /api/teams/{id}/members/{userId}
 */
export const updateTeamMemberRole = (
  teamId: number,
  userId: string,
  dto: UpdateTeamMemberDto,
) =>
  apiClient.patch<ApiResponse<TeamMemberDto>>(
    `/teams/${teamId}/members/${userId}`,
    dto,
  );

/**
 * Remove team member
 * DELETE /api/teams/{id}/members/{userId}
 */
export const removeTeamMember = (teamId: number, userId: string) =>
  apiClient.delete<ApiResponse<null>>(`/teams/${teamId}/members/${userId}`);

// ── Manager Report (AI) ────────────────────────────────────────────────────

/**
 * Generate AI manager report (calls Gemini — ~30s timeout)
 * GET /api/manager-report?deptId=&weekStart=
 */
export const getManagerReport = (deptId?: number, weekStart?: string) =>
  apiClient.get<ApiResponse<ManagerReportDto>>("/manager-report", {
    params: { deptId, weekStart },
    timeout: 60000, // 60s for AI call
  });

// ── Export (Excel) ─────────────────────────────────────────────────────────

/**
 * Export tasks as Excel file
 * GET /api/export/tasks — returns blob
 */
export const exportTasksExcel = async (params?: {
  status?: string;
  priority?: string;
  teamId?: number;
  fromDate?: string;
  toDate?: string;
}) => {
  const token = localStorage.getItem("auth_token");
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.priority) query.set("priority", params.priority);
  if (params?.teamId) query.set("teamId", String(params.teamId));
  if (params?.fromDate) query.set("fromDate", params.fromDate);
  if (params?.toDate) query.set("toDate", params.toDate);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5211/api");
  const res = await fetch(`${baseUrl}/export/tasks?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export team performance as Excel
 * GET /api/export/team-performance/{teamId}
 */
export const exportTeamPerformanceExcel = async (
  teamId: number,
  from?: string,
  to?: string,
) => {
  const token = localStorage.getItem("auth_token");
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5211/api");
  const res = await fetch(
    `${baseUrl}/export/team-performance/${teamId}?${query}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `team_performance_${teamId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export burnout signals as Excel
 * GET /api/export/burnout
 */
export const exportBurnoutExcel = async (params?: {
  riskLevel?: string;
  isResolved?: boolean;
  departmentId?: number;
}) => {
  const token = localStorage.getItem("auth_token");
  const query = new URLSearchParams();
  if (params?.riskLevel) query.set("riskLevel", params.riskLevel);
  if (params?.isResolved !== undefined) query.set("isResolved", String(params.isResolved));
  if (params?.departmentId) query.set("departmentId", String(params.departmentId));

  const baseUrl = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5211/api");
  const res = await fetch(`${baseUrl}/export/burnout?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `burnout_signals_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Survey Analytics ───────────────────────────────────────────────────────

/**
 * Survey aggregation for a dept/month
 * GET /api/survey/aggregation?year=&month=&departmentId=
 */
export const getSurveyAggregation = (params: {
  year: number;
  month: number;
  departmentId?: number;
}) =>
  apiClient.get<ApiResponse<SurveyAggregationDto>>("/survey/aggregation", {
    params,
  });

/**
 * Survey response rate
 * GET /api/survey/response-rate?year=&month=
 */
export const getSurveyResponseRate = (year: number, month: number) =>
  apiClient.get<ApiResponse<SurveyResponseRateDto>>("/survey/response-rate", {
    params: { year, month },
  });

// ============================================================================
// Phase 5: HR / Analytics & AI Insights DTOs & API Endpoints
// ============================================================================

export interface MonthlyKpiDto {
  kpiYear: number;
  kpiMonth: number;
  monthLabel: string;
  avgEfficiency: number | null;
  avgMorale: number | null;
  avgStress: number | null;
  departmentId: number | null;
  departmentName: string | null;
}

export interface KpiTrendDto {
  months: MonthlyKpiDto[];
  efficiencyTrend: number | null;
  moraleTrend: number | null;
}

export interface DepartmentInsightDto {
  departmentId: number;
  departmentName: string;
  insightMonth: number;
  insightYear: number;
  insightText: string;
  severity: string; // "LOW" | "MEDIUM" | "HIGH"
  generatedAt: string;
}

export interface OrgHealthScoreDto {
  score: number;
  healthLevel: string; // "HEALTHY" | "CAUTION" | "CRITICAL"
  prevMonthScore: number | null;
  scoreChangePct: number | null;
  avgEfficiency: number | null;
  avgMorale: number | null;
  avgStress: number | null;
  totalHighBurnout: number;
  totalMediumBurnout: number;
  surveyResponseRate: number;
  totalActiveEmployees: number;
}

export interface DeptSentimentDto {
  departmentId: number;
  departmentName: string;
  sentimentStatus: string; // "GREEN" | "YELLOW" | "RED"
  avgMorale: number | null;
  avgStress: number | null;
  avgEfficiency: number | null;
  totalEmployees: number;
  surveyResponseCount: number;
  highBurnoutCount: number;
  behavioralPatternCount: number;
}

export interface SurveyInsightDto {
  totalResponses: number;
  totalEmployees: number;
  responseRatePct: number;
  avgMorale: number;
  avgStress: number;
  moraleChangePct: number | null;
  stressChangePct: number | null;
  lowMoraleCount: number;
  highStressCount: number;
}

export interface InterventionCaseDto {
  userId: string;
  fullName: string;
  departmentName: string;
  priority: string; // "HIGH" | "MEDIUM"
  reasons: string[];
  recommendedAction: string;
}

export interface FlightRiskDeptDto {
  departmentName: string;
  atRiskCount: number;
  riskDrivers: string[];
}

export interface HrReportDto {
  year: number;
  month: number;
  monthLabel: string;
  generatedAt: string;
  orgHealth: OrgHealthScoreDto;
  departmentSentiment: DeptSentimentDto[];
  surveyInsights: SurveyInsightDto;
  interventionQueue: InterventionCaseDto[];
  flightRiskDepartments: FlightRiskDeptDto[];
  aiReport: string;
}

/**
 * Generate monthly HR report (calls Gemini — ~30s timeout)
 * GET /api/hr-report?year=&month=
 */
export const getHrReport = (year?: number, month?: number) =>
  apiClient.get<ApiResponse<HrReportDto>>("/hr-report", {
    params: { year, month },
    timeout: 60000, // 60s for AI call
  });

/**
 * Get company KPI trends
 * GET /api/kpi/company?months=6
 */
export const getKpiTrendsCompany = (months = 6) =>
  apiClient.get<ApiResponse<KpiTrendDto>>("/kpi/company", {
    params: { months },
  });

/**
 * Get department KPI trends
 * GET /api/kpi/department/{id}?months=6
 */
export const getKpiTrendsDepartment = (deptId: number, months = 6) =>
  apiClient.get<ApiResponse<KpiTrendDto>>(`/kpi/department/${deptId}`, {
    params: { months },
  });

/**
 * Get survey aggregation trend
 * GET /api/survey/aggregation/trend?months=6&departmentId=
 */
export const getSurveyAggregationTrend = (months = 6, departmentId?: number) =>
  apiClient.get<ApiResponse<SurveyAggregationDto[]>>("/survey/aggregation/trend", {
    params: { months, departmentId },
  });

/**
 * Get latest company insight
 * GET /api/insights/company/latest
 */
export const getLatestCompanyInsight = () =>
  apiClient.get<ApiResponse<DepartmentInsightDto | null>>("/insights/company/latest");

/**
 * Get latest department insight
 * GET /api/insights/department/{deptId}/latest
 */
export const getLatestDeptInsight = (deptId: number) =>
  apiClient.get<ApiResponse<DepartmentInsightDto | null>>(`/insights/department/${deptId}/latest`);

/**
 * Get department insights list
 * GET /api/insights/department/{deptId}?year=&month=
 */
export const getDeptInsights = (deptId: number, year?: number, month?: number) =>
  apiClient.get<ApiResponse<DepartmentInsightDto[]>>(`/insights/department/${deptId}`, {
    params: { year, month },
  });

/**
 * Get burnout patterns (Manager/HR/CEO view)
 * GET /api/burnout/patterns?userId=&severity=&from=&to=
 */
export const getBurnoutPatterns = (params?: {
  userId?: string;
  severity?: string;
  from?: string;
  to?: string;
}) =>
  apiClient.get<ApiResponse<BehavioralPatternDto[]>>("/burnout/patterns", { params });

/**
 * Get personal performance range breakdown
 * GET /api/performance/me/range?from=&to=
 */
export const getMyPerformanceRange = (from: string, to: string) =>
  apiClient.get<ApiResponse<any>>("/performance/me/range", {
    params: { from, to },
  });

// ── Meetings & Google Calendar APIs ──────────────────────────────────────────

export interface CreateMeetingDto {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location?: string;
  departmentId?: number;
  teamId?: number;
  participantUserIds: string[];
}

export interface MeetingParticipantDto {
  userId: string;
  fullName: string;
  email: string;
  roleName: string;
  status: string; // "PENDING" | "ACCEPTED" | "DECLINED"
}

export interface MeetingDto {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  departmentId?: number;
  departmentName?: string;
  teamId?: number;
  teamName?: string;
  organizerId: string;
  organizerName: string;
  participantCount: number;
  participants?: MeetingParticipantDto[];
}

export interface MeetingLoadDto {
  userId: string;
  userName: string;
  weekStart: string;
  totalMeetingMinutes: number;
  workingMinutesPerWeek: number;
  meetingLoadRatio: number;
  isOverloaded: boolean;
  loadLabel: string;
  meetings: MeetingDto[];
}

export const getMeetings = (from: string, to: string, userId?: string) =>
  apiClient.get<ApiResponse<MeetingDto[]>>("/meetings", {
    params: { from, to, userId },
  });

export const getMeetingById = (id: number) =>
  apiClient.get<ApiResponse<MeetingDto>>(`/meetings/${id}`);

export const getMyMeetings = (from: string, to: string) =>
  apiClient.get<ApiResponse<MeetingDto[]>>("/meetings/me", {
    params: { from, to },
  });

export const getMyMeetingLoad = (week?: string) =>
  apiClient.get<ApiResponse<MeetingLoadDto>>("/meetings/me/load", {
    params: { week },
  });

export const getDepartmentMeetings = (deptId: number, from: string, to: string) =>
  apiClient.get<ApiResponse<MeetingDto[]>>(`/meetings/department/${deptId}`, {
    params: { from, to },
  });

export const createMeeting = (dto: CreateMeetingDto) =>
  apiClient.post<ApiResponse<MeetingDto>>("/meetings", dto);

export interface GoogleAuthUrlDto {
  authUrl: string;
}

export const getGoogleCalendarAuthUrl = () =>
  apiClient.get<ApiResponse<GoogleAuthUrlDto>>("/integrations/google-calendar/auth-url");

export const getGoogleCalendarStatus = () =>
  apiClient.get<ApiResponse<{ isConnected: boolean; email?: string }>>("/integrations/google-calendar/status");

export const disconnectGoogleCalendar = () =>
  apiClient.delete<ApiResponse<null>>("/integrations/google-calendar/disconnect");

export const syncGoogleCalendar = () =>
  apiClient.post<ApiResponse<null>>("/integrations/google-calendar/sync");

// ── TaskType & StandardTime Management APIs ──────────────────────────────────

export interface CreateTaskTypeDto {
  code: string;
  name: string;
  category?: string;
}

export interface UpdateTaskTypeDto {
  name: string;
  category?: string;
  isActive?: boolean;
}

export interface CreateStandardTimeDto {
  observedTime: number; // minutes
  ratingFactor: number; // 0.8 | 1.0 | 1.2
  pfdFactor: number; // default 0.15
}

export const createTaskType = (dto: CreateTaskTypeDto) =>
  apiClient.post<ApiResponse<TaskTypeDto>>("/task-types", dto);

export const updateTaskType = (id: number, dto: UpdateTaskTypeDto) =>
  apiClient.put<ApiResponse<TaskTypeDto>>(`/task-types/${id}`, dto);

export const deactivateTaskType = (id: number) =>
  apiClient.patch<ApiResponse<null>>(`/task-types/${id}/deactivate`);

export const getStandardTimes = (taskTypeId: number) =>
  apiClient.get<ApiResponse<StandardTimeDto[]>>(`/task-types/${taskTypeId}/standard-times`);

export const createStandardTime = (taskTypeId: number, dto: CreateStandardTimeDto) =>
  apiClient.post<ApiResponse<StandardTimeDto>>(`/task-types/${taskTypeId}/standard-times`, dto);


