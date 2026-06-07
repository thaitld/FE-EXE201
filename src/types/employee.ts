/**
 * Employee/Staff Workflow Types (Phase 3)
 * All DTOs for personal dashboard, tasks, time tracking, and surveys
 */

// ============================================================================
// Personal Dashboard DTOs
// ============================================================================

export interface DailyPerformanceDto {
  userId: string; // Guid
  userName: string;
  reportDate: string; // "YYYY-MM-DD"
  totalStandardMinutes: number;
  totalActualMinutes: number;
  totalTasks: number;
  efficiencyRatio: number; // 0.000–2.000
  efficiencyLabel: string; // "Xuất sắc"|"Tốt"|"Trung bình"|"Cần cải thiện"
}

export interface TaskInstanceSummaryDto {
  id: number;
  taskCode: string;
  title: string;
  status: string; // "PENDING"|"IN_PROGRESS"|"PAUSED"|"COMPLETED"|"CANCELLED"|"WAITING_FOR_APPROVAL"|"REJECTED"
  priority: string; // "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
  taskTypeName: string;
  assignedUserName: string;
  expectedCompletion: string; // ISO datetime string
  isOverdue: boolean;
}

export interface DailyEfficiencyPointDto {
  date: string; // "YYYY-MM-DD"
  efficiencyRatio: number | null;
  efficiencyLabel: string;
}

export interface PersonalBurnoutInsightDto {
  riskLevel: string; // "LOW"|"MEDIUM"|"HIGH"
  riskScore: number; // 0–100
  triggerFactors: string[]; // e.g. ["LOW_EFFICIENCY", "HIGH_STRESS"]
  detectedDate: string; // "YYYY-MM-DD"
}

export interface PersonalDashboardDto {
  todayPerformance: DailyPerformanceDto | null; // null if no data yesterday
  pendingTasks: number;
  inProgressTasks: number;
  completedThisWeek: number;
  upcomingDeadlines: TaskInstanceSummaryDto[]; // top 5, sorted by deadline
  weeklyTrend: DailyEfficiencyPointDto[]; // 7 points
  burnoutInsight: PersonalBurnoutInsightDto | null; // null if no burnout signal
}

// ============================================================================
// Task Management DTOs
// ============================================================================

export interface TaskInstanceDto {
  id: number;
  taskCode: string;
  title: string;
  status: string; // "PENDING"|"IN_PROGRESS"|"PAUSED"|"COMPLETED"|"CANCELLED"|"WAITING_FOR_APPROVAL"|"REJECTED"
  priority: string; // "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
  taskTypeId: number;
  taskTypeName: string;
  taskTypeCode: string;
  standardTimeMinutes: number;
  assignedUserId: string;
  assignedUserName: string;
  plannedQuantity: number;
  expectedCompletion: string; // ISO datetime string
  isOverdue: boolean;
  startedAt: string | null;
  completedAt: string | null;
  actualMinutes: number | null;
  efficiencyRatio: number | null;
  submissionNote: string | null;
  deliverableUrl: string | null;
  rejectionReason: string | null;
  createdAt: string | null;
}

export interface TaskCommentDto {
  id: number;
  taskInstanceId: number;
  userId: string;
  userName: string;
  userAvatarInitials: string | null;
  content: string;
  createdAt: string;
  isOwnComment: boolean;
}

export interface TaskAttachmentDto {
  id: number;
  taskInstanceId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

// ============================================================================
// Time Tracking DTOs
// ============================================================================

export interface TimeTrackingSessionDto {
  sessionId: string;
  taskInstanceId: number;
  taskCode: string;
  taskTitle: string;
  currentAction: string; // "STARTED"|"PAUSED"|"RESUMED"
  lastActionAt: string; // ISO datetime
  elapsedSeconds: number;
}

export interface TimeTrackingStartResponseDto {
  sessionId: string;
  startedAt: string;
  taskCode: string;
  taskTitle: string;
  message: string;
}

export interface TimeTrackingPauseRequestDto {
  sessionId: string;
}

export interface TimeTrackingPauseResponseDto {
  sessionId: string;
  action: string; // "PAUSED"
  timestamp: string;
  taskStatus: string; // "PAUSED"
}

export interface TimeTrackingResumeRequestDto {
  sessionId: string;
}

export interface TimeTrackingResumeResponseDto {
  sessionId: string;
  action: string; // "RESUMED"
  timestamp: string;
  taskStatus: string; // "IN_PROGRESS"
}

export interface TimeTrackingStopRequestDto {
  sessionId: string;
  note?: string;
}

export interface TimeTrackingEntry {
  action: string;
  timestamp: string;
  durationSeconds: number | null;
}

export interface TimeTrackingStopResponseDto {
  sessionId: string;
  sessionDurationSeconds: number;
  cumulativeDurationSeconds: number;
  standardTimeSeconds: number;
  efficiencyRatio: number | null;
  note: string | null;
  entries: TimeTrackingEntry[];
}

// ============================================================================
// Survey DTOs
// ============================================================================

export interface SurveyStatusDto {
  hasSubmittedThisMonth: boolean;
  currentMonth: number;
  currentYear: number;
  daysRemainingInMonth: number;
}

export interface SurveySubmitRequestDto {
  moraleScore: number; // 1-5
  stressScore: number; // 1-5
  comment?: string;
}

export interface SurveyResponseDto {
  id: number;
  moraleScore: number;
  stressScore: number;
  comment: string | null;
  surveyMonth: number;
  surveyYear: number;
  monthLabel: string;
  createdAt: string;
  submittedAt?: string;
}

export interface SurveyHistoryDto {
  responses: SurveyResponseDto[];
  avgMoraleScore: number | null;
  avgStressScore: number | null;
  trend: {
    moraleTrend: string;
    stressTrend: string;
    moraleChange: number;
    stressChange: number;
  } | null;
}

// ============================================================================
// Burnout DTOs
// ============================================================================

export interface BehavioralPatternDto {
  pattern: string; // e.g., "HIGH_OVERTIME", "LOW_COMPLETION_RATE"
  frequency: number;
  lastDetectedAt: string;
  severity: string; // "LOW"|"MEDIUM"|"HIGH"
}

// ============================================================================
// Notification DTOs (enhanced for Phase 3)
// ============================================================================

export interface NotificationDto {
  id: number;
  userId: string;
  type: string; // e.g., "TASK_ASSIGNED", "TASK_COMMENT", "SURVEY_DUE"
  title: string;
  message: string;
  taskInstanceId?: number;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// Query/Filter DTOs
// ============================================================================

export interface TaskFilterParams {
  status?: string;
  priority?: string;
  isOverdue?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string; // default: "expectedCompletion"
  sortDir?: "asc" | "desc";
}

// ============================================================================
// Custom Survey DTOs
// ============================================================================

export interface CreateCustomSurveyQuestionDto {
  questionText: string;
  questionType: "Rating" | "Text";
  isRequired: boolean;
  orderIndex: number;
}

export interface CreateCustomSurveyDto {
  title: string;
  description?: string;
  targetType: "All" | "Department" | "Team";
  targetDepartmentId?: number;
  targetTeamId?: number;
  startDate: string;
  endDate: string;
  questions: CreateCustomSurveyQuestionDto[];
}

export interface CustomSurveyQuestionDto {
  id: number;
  questionText: string;
  questionType: "Rating" | "Text";
  isRequired: boolean;
  orderIndex: number;
}

export interface CustomSurveyDto {
  id: number;
  title: string;
  description?: string;
  createdByUserId: string;
  createdByName: string;
  targetType: "All" | "Department" | "Team";
  targetDepartmentId?: number;
  targetDepartmentName?: string;
  targetTeamId?: number;
  targetTeamName?: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Closed";
  createdAt: string;
  totalTargetCount: number;
  responseCount: number;
  hasAnswered: boolean;
  questions: CustomSurveyQuestionDto[];
}

export interface SurveyAnswerItemDto {
  questionId: number;
  ratingValue?: number;
  textValue?: string;
}

export interface SubmitCustomSurveyAnswersDto {
  answers: SurveyAnswerItemDto[];
}

export interface QuestionResultDto {
  questionId: number;
  questionText: string;
  questionType: "Rating" | "Text";
  averageRating?: number;
  ratingDistribution?: Record<number, number>;
  textAnswers?: string[];
}

export interface CustomSurveyResultDto {
  surveyId: number;
  title: string;
  totalTargetCount: number;
  responseCount: number;
  responseRate: number;
  questions: QuestionResultDto[];
}

