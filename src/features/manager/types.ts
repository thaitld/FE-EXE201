import type {
  ApiResponse,
  BulkCreateResultDto,
  CreateDepartmentDto,
  CreateStandardTimeDto,
  CreateTaskInstanceDto,
  CreateTaskTypeDto,
  CreateTeamDto,
  DepartmentDto,
  PagedResult,
  TaskInstanceDto,
  TaskInstanceFilter,
  TaskTypeDto,
  TeamDetailDto,
  UpdateDepartmentDto,
  UpdateTaskInstanceDto,
  UpdateTaskTypeDto,
  UpdateTeamDto,
} from '@/lib/api'

export type {
  ApiResponse,
  BulkCreateResultDto,
  CreateDepartmentDto,
  CreateStandardTimeDto,
  CreateTaskInstanceDto,
  CreateTaskTypeDto,
  CreateTeamDto,
  DepartmentDto,
  PagedResult,
  TaskInstanceDto,
  TaskInstanceFilter,
  TaskTypeDto,
  TeamDetailDto,
  UpdateDepartmentDto,
  UpdateTaskInstanceDto,
  UpdateTaskTypeDto,
  UpdateTeamDto,
}

export interface WorkScheduleDto {
  id: number
  teamId: number
  teamName: string
  workStart: string
  workEnd: string
  lunchStart: string
  lunchEnd: string
  standardMinutesPerDay: number
  shiftLabel: string
}

export interface UpdateWorkScheduleDto {
  workStart: string
  workEnd: string
  lunchStart: string
  lunchEnd: string
}

export interface OvertimeReportDto {
  userId: string
  userName: string
  reportDate: string
  workEnd: string
  actualLastActivity: string | null
  overtimeMinutes: number
  hasOvertime: boolean
}

export interface TeamPerformanceMemberDto {
  userId: string
  userName: string
  efficiencyRatio: number
  efficiencyLabel: string
  totalTasks: number
}

export interface TeamPerformanceDto {
  teamId: number
  teamName: string
  reportDate: string
  avgEfficiencyRatio: number
  avgEfficiencyLabel: string
  totalMembers: number
  activeMembers: number
  members: TeamPerformanceMemberDto[]
}

export interface BurnoutSignalDto {
  id: number
  userId: string
  userName: string
  department: string | null
  team: string | null
  riskScore: number
  riskLevel: string
  triggerFactors: string[]
  detectedDate: string
  isResolved: boolean
  createdAt: string
}

export interface ResolveBurnoutDto {
  resolutionNote: string
}

export interface SurveyAggregationDto {
  avgMoraleScore: number
  avgStressScore: number
  responseCount: number
  responseRate: number
}

export interface SurveyResponseRateDto {
  submittedCount: number
  notSubmittedCount: number
  responseRate: number
  notSubmittedUsers: string[]
}

export interface DepartmentDashboardTeamSummaryDto {
  teamId: number
  teamName: string
  avgEfficiencyRatio: number
  avgEfficiencyLabel: string
  memberCount: number
  pendingTasks: number
  members: null
}

export interface BurnoutAlertItemDto {
  signalId: number
  userName: string
  riskScore: number
  riskLevel: string
  detectedDate: string
}

export interface AlertSummaryDto {
  id: number
  alertType: string
  message: string
  severity: string
  createdAt: string | null
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
  teams: DepartmentDashboardTeamSummaryDto[]
  highRiskBurnoutCount: number
  mediumRiskBurnoutCount: number
  recentHighRiskAlerts: BurnoutAlertItemDto[]
  monthlyTrend: Array<{ date: string; efficiencyRatio: number | null; efficiencyLabel: string }>
  unreadAlerts: AlertSummaryDto[]
}

export interface TeamHealthSummaryDto {
  totalMembers: number
  greenCount: number
  yellowCount: number
  redCount: number
  avgWeeklyEfficiency: number | null
  efficiencyLabel: string
  avgDailyOvertimeHours: number
  taskCompletionRate: number
  totalMeetingsThisWeek: number
}

export interface MemberSnapshotDto {
  userId: string
  fullName: string
  trafficLight: string
  trafficLightReason: string
  weeklyEfficiency: number | null
  efficiencyLabel: string
  efficiencyDeltaPct: number | null
  totalOvertimeHoursThisWeek: number
  overtimeDaysCount: number
  burnoutRiskLevel: string | null
  burnoutScore: number | null
  burnoutTriggers: string[]
  latestMoraleScore: number | null
  latestStressScore: number | null
  activeBehavioralPatterns: number
  patternCodes: string[]
  meetingLoadPct: number
  pendingTasks: number
  completedTasksThisWeek: number
}

export interface ManagerReportDto {
  departmentId: number
  departmentName: string
  weekStart: string
  weekEnd: string
  weekLabel: string
  generatedAt: string
  aiReport: string
  teamHealth: TeamHealthSummaryDto
  members: MemberSnapshotDto[]
}

export interface ManagerTaskListFilter extends TaskInstanceFilter {
  teamId?: number
}

export interface CloneTaskResponseDto {
  createdId: number
}

export interface ManagerActionResultDto {
  success: boolean
  message: string | null
}

export type ManagerApiResponse<T> = ApiResponse<T>

export interface AssigneeSuggestionDto {
  userId: string
  userName: string
  rank: number
  fitScore: number
  fitLabel: string
  reasoning: string
  metrics: {
    activeTaskCount: number
    avgEfficiencyRatio: number | null
    overtimeDaysThisWeek: number
    burnoutRiskLevel: string
    taskTypeExperienceCount: number
  }
}
