import axios from "axios";
import type {
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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

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

  if (token && config.headers) {
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

export interface DailyPerformanceDto {
  userId: string
  userName: string
  reportDate: string
  totalStandardMinutes: number
  totalActualMinutes: number
  totalTasks: number
  efficiencyRatio: number
  efficiencyLabel: string
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

export interface DailyEfficiencyPointDto {
  date: string
  efficiencyRatio: number | null
  efficiencyLabel: string
}

export interface TaskInstanceSummaryDto {
  id: number
  taskCode: string
  title: string
  status: string
  priority: string
  taskTypeName: string
  assignedUserName: string
  expectedCompletion: string
  isOverdue: boolean
}

export interface PersonalBurnoutInsightDto {
  riskLevel: string
  riskScore: number
  triggerFactors: string[]
  detectedDate: string
}

export interface PersonalDashboardDto {
  todayPerformance: DailyPerformanceDto | null
  pendingTasks: number
  inProgressTasks: number
  completedThisWeek: number
  upcomingDeadlines: TaskInstanceSummaryDto[]
  weeklyTrend: DailyEfficiencyPointDto[]
  burnoutInsight: PersonalBurnoutInsightDto | null
}

export interface TeamPerformanceSummaryDto {
  teamId: number
  teamName: string
  avgEfficiencyRatio: number
  avgEfficiencyLabel: string
  avgMoraleScore?: number
  avgStressScore?: number
  totalActiveTasks?: number
  overdueTasks?: number
  activeMembers?: number
  highRiskBurnoutCount?: number
}

export interface BurnoutAlertItemDto {
  id: number
  userName: string
  departmentName?: string | null
  teamName?: string | null
  riskLevel: string
  riskScore: number
  message: string
  detectedDate: string
  isResolved?: boolean
}

export interface DepartmentDashboardDto {
  departmentId: number
  departmentName: string
  year: number
  month: number
  avgEfficiencyRatio: number
  avgEfficiencyLabel: string
  avgMoraleScore: number
  avgStressScore: number
  totalActiveTasks: number
  overdueTasks: number
  completedThisMonth: number
  teams: TeamPerformanceSummaryDto[]
  highRiskBurnoutCount: number
  mediumRiskBurnoutCount: number
  recentHighRiskAlerts: BurnoutAlertItemDto[]
  monthlyTrend: DailyEfficiencyPointDto[]
  unreadAlerts: AlertSummaryDto[]
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
  role?: string;
  teamName: string | null;
  departmentName: string | null;
  departmentId?: number;
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

// ==================== Task DTOs ====================

export interface TaskInstanceDto {
  id: number
  taskCode: string
  title: string
  status: string // "PENDING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "CANCELLED" | "WAITING_FOR_APPROVAL" | "REJECTED"
  priority: string // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  taskTypeId: number
  taskTypeName: string
  taskTypeCode: string
  standardTimeMinutes: number
  assignedUserId: string
  assignedUserName: string
  assignedUserDepartment: string | null
  plannedQuantity: number
  expectedCompletion: string
  isOverdue: boolean
  startedAt: string | null
  completedAt: string | null
  actualMinutes: number | null
  efficiencyRatio: number | null
  submissionNote: string | null
  deliverableUrl: string | null
  rejectionReason: string | null
  createdAt: string | null
}

export interface TaskInstanceFilter {
  status?: string
  assignedUserId?: string
  teamId?: number
  taskTypeId?: number
  isOverdue?: boolean
  priority?: string
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: string
}

export interface CreateTaskInstanceDto {
  taskTypeId: number
  title: string
  assignedUserId: string
  plannedQuantity?: number
  expectedCompletion: string
  priority?: string
}

export interface UpdateTaskInstanceDto {
  title?: string
  expectedCompletion?: string
  plannedQuantity?: number
}

export interface BulkCreateTaskInstanceDto {
  tasks: CreateTaskInstanceDto[]
}

export interface BulkCreateErrorDto {
  index: number
  field: string
  message: string
}

export interface BulkCreateResultDto {
  successCount: number
  failCount: number
  errors: BulkCreateErrorDto[]
  createdIds: number[]
}

export interface ReassignTaskDto {
  newAssignedUserId: string
  reason?: string
}

export interface UpdateTaskStatusDto {
  status: 'COMPLETED' | 'CANCELLED' | 'WAITING_FOR_APPROVAL' | 'REJECTED'
  note?: string
  submissionNote?: string
  deliverableUrl?: string
  rejectionReason?: string
}

export interface CloneTaskDto {
  title?: string
  assignedUserId?: string
  expectedCompletion?: string
  priority?: string
}

export interface TaskCommentDto {
  id: number
  taskInstanceId: number
  userId: string
  userName: string
  userAvatarInitials: string | null
  content: string
  createdAt: string
  isOwnComment: boolean
}

export interface AddCommentDto {
  content: string
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

export interface TaskTypeDto {
  id: number
  code: string
  name: string
  description: string | null
  category: string | null
  isActive: boolean
  hasActiveStandardTime: boolean
  currentStandardTime: number | null
  createdAt: string | null
  requiresApproval?: boolean
}

export interface CreateTaskTypeDto {
  code: string
  name: string
  description?: string
  category?: string
}

export interface UpdateTaskTypeDto {
  code?: string
  name?: string
  description?: string
  category?: string
  isActive?: boolean
}

export interface StandardTimeDto {
  id: number
  taskTypeId: number
  taskTypeCode: string
  taskTypeName: string
  observedTime: number
  ratingFactor: number
  pfdFactor: number
  standardTime: number | null
  version: number
  isActive: boolean
  createdAt: string | null
}

export interface CreateStandardTimeDto {
  observedTime: number
  ratingFactor: number
  pfdFactor: number
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
// Phase 5: Analytics & AI Insights API Endpoints
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

export interface SurveyAggregationDto {
  surveyMonth: number;
  surveyYear: number;
  monthLabel: string;
  departmentId: number | null;
  departmentName: string | null;
  avgMoraleScore: number;
  avgStressScore: number;
  responseCount: number;
  totalEligible: number;
  responseRate: number;
  moraleDistribution: { score1: number; score2: number; score3: number; score4: number; score5: number };
  stressDistribution: { score1: number; score2: number; score3: number; score4: number; score5: number };
}

export interface DepartmentInsightDto {
  departmentId: number;
  departmentName: string;
  insightMonth: number;
  insightYear: number;
  insightText: string;
  severity: string;
  generatedAt: string;
}

export interface ApiBehavioralPatternDto {
  id: number;
  userId: string;
  userName: string;
  patternCode: string;
  description: string;
  detectedDate: string;
  severity: string;
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

export interface PerformanceRangeDto {
  userId: string;
  userName: string;
  fromDate: string;
  toDate: string;
  avgEfficiencyRatio: number;
  avgEfficiencyLabel: string;
  totalStandardMinutes: number;
  totalActualMinutes: number;
  totalTasks: number;
  dailyBreakdown: DailyPerformanceDto[];
}

export interface OrgHealthScoreDto {
  score: number;
  healthLevel: string;
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
  departmentId?: number;
  departmentName: string;
  sentimentStatus: string; // "GREEN" | "YELLOW" | "RED"
  avgMorale?: number | null;
  avgStress?: number | null;
  avgEfficiency?: number | null;
  totalEmployees?: number;
  surveyResponseCount?: number;
  highBurnoutCount?: number;
  highRiskBurnoutCount?: number;
  behavioralPatternCount?: number;
}

export interface SurveyInsightDto {
  moraleScoreAverage?: number;
  stressScoreAverage?: number;
  totalResponses?: number;
  totalEmployees?: number;
  responseRatePct?: number;
  avgMorale?: number;
  avgStress?: number;
  moraleChangePct: number | null;
  stressChangePct?: number | null;
  lowMoraleCount?: number;
  highStressCount?: number;
}

export interface InterventionCaseDto {
  userId: string;
  fullName: string;
  departmentName: string;
  priority: string;
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

export const getCompanyKpiTrend = (months: number = 6) =>
  apiClient.get<ApiResponse<KpiTrendDto>>("/kpi/company", { params: { months } });

export const getDepartmentKpiTrend = (id: number, months: number = 6) =>
  apiClient.get<ApiResponse<KpiTrendDto>>(`/kpi/department/${id}`, { params: { months } });

export const getKpiTrendAnalysis = () =>
  apiClient.get<ApiResponse<unknown>>("/kpi/trend-analysis");

export const getSurveyAggregationTrend = (months: number = 6, departmentId?: number) =>
  apiClient.get<ApiResponse<SurveyAggregationDto[]>>("/survey/aggregation/trend", {
    params: { months, departmentId },
  });

export const getSurveyAggregationDepartment = (departmentId: number, year?: number, month?: number) =>
  apiClient.get<ApiResponse<SurveyAggregationDto>>(`/survey/aggregation/department/${departmentId}`, {
    params: { year, month },
  });

export const getDepartmentInsights = (id: number, year?: number, month?: number) =>
  apiClient.get<ApiResponse<DepartmentInsightDto[]>>(`/insights/department/${id}`, {
    params: { year, month },
  });

export const getLatestDepartmentInsight = (id: number) =>
  apiClient.get<ApiResponse<DepartmentInsightDto | null>>(`/insights/department/${id}/latest`);

export const getLatestCompanyInsight = () =>
  apiClient.get<ApiResponse<DepartmentInsightDto | null>>("/insights/company/latest");

export const getBurnoutPatterns = (params?: { userId?: string; severity?: string; from?: string; to?: string }) =>
  apiClient.get<ApiResponse<ApiBehavioralPatternDto[]>>("/burnout/patterns", { params });

export const getBurnoutPatternsByUser = (userId: string) =>
  apiClient.get<ApiResponse<ApiBehavioralPatternDto[]>>(`/burnout/patterns/user/${userId}`);

export const getBurnoutPatternsByDepartment = (deptId: number, from?: string, to?: string) =>
  apiClient.get<ApiResponse<ApiBehavioralPatternDto[]>>(`/burnout/patterns/department/${deptId}`, {
    params: { from, to },
  });

export const getBurnoutSignals = (params?: { riskLevel?: string; isResolved?: boolean; departmentId?: number; page?: number; pageSize?: number }) =>
  apiClient.get<ApiResponse<{ items: BurnoutSignalDto[]; totalCount: number }>>("/burnout/signals", { params });

export const getPersonalPerformanceRange = (from: string, to: string) =>
  apiClient.get<ApiResponse<PerformanceRangeDto>>("/performance/me/range", { params: { from, to } });

export const getDepartmentPerformanceRange = (deptId: number, from?: string, to?: string) =>
  apiClient.get<ApiResponse<PerformanceRangeDto>>(`/performance/department/${deptId}`, { params: { from, to } });

export const getHrReport = (year?: number, month?: number) =>
  apiClient.get<ApiResponse<HrReportDto>>("/hr-report", { params: { year, month } });

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

export const createTask = (dto: CreateTaskInstanceDto) =>
  apiClient.post<ApiResponse<TaskInstanceDto>>("/tasks", dto);

export const suggestAssignee = (taskTypeId: number, teamId?: number) =>
  apiClient.get<ApiResponse<AssigneeSuggestionDto[]>>("/tasks/suggest-assignee", {
    params: { taskTypeId, teamId },
  });

export const getTaskTypes = (isActive?: boolean) =>
  apiClient.get<ApiResponse<TaskTypeDto[]>>("/task-types", {
    params: { isActive },
  });

export const getLatestDeptInsight = getLatestDepartmentInsight;
export const getDeptInsights = getDepartmentInsights;
export const getKpiTrendsCompany = getCompanyKpiTrend;
export const getKpiTrendsDepartment = getDepartmentKpiTrend;

