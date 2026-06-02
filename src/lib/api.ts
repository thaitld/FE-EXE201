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
  apiClient.get<ApiResponse<SurveyHistoryDto[]>>("/survey/history");

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
