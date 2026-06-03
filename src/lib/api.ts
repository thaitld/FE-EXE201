import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:5211/api'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export interface ApiResponse<T> {
  succeeded: boolean
  message: string | null
  data: T | null
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  token: string
}

export interface ForgotPasswordRequestDto {
  email: string
}

export interface ResetPasswordRequestDto {
  email: string
  token: string
  newPassword: string
}

export interface GoogleAuthUrlResponse {
  authUrl: string
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
  departmentId: number
  departmentName: string
  avgEfficiencyRatio: number
  avgEfficiencyLabel: string
  avgMoraleScore: number
  headCount: number
  highRiskBurnoutCount: number
}

export interface BurnoutOverviewDto {
  highRisk: number
  mediumRisk: number
  lowRisk: number
  resolved: number
}

export interface MonthlyKpiPointDto {
  year: number
  month: number
  avgEfficiency: number
  avgMorale: number
  avgStress: number
}

export interface AlertSummaryDto {
  id: number
  alertType: string
  message: string
  severity: string
  createdAt: string | null
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
  year: number
  month: number
  avgEfficiencyRatio: number
  avgEfficiencyLabel: string
  avgMoraleScore: number
  avgStressScore: number
  totalActiveEmployees: number
  departments: DepartmentKpiSummaryDto[]
  burnoutOverview: BurnoutOverviewDto
  quarterlyTrend: MonthlyKpiPointDto[]
  systemAlerts: AlertSummaryDto[]
  monthlyInsight: string | null
}

export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  roleName: string
  teamName: string | null
  departmentName: string | null
  roleInTeam: string | null
  createdAt: string
  avatarUrl?: string | null
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface AdminUserFilter {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface RoleDto {
  id: number
  name: string
  normalizedName: string
}

export interface TeamDetailDto {
  id: number
  code: string
  name: string
  departmentId: number
  departmentName: string
  teamLeadUserId: string | null
  teamLeadName: string | null
  shift: string | null
  isActive: boolean
  memberCount: number
}

export interface DepartmentDto {
  id: number
  name: string
  managerUserId: string | null
  managerName: string | null
  isActive: boolean
  teamCount: number
}

export interface CreateDepartmentDto {
  name: string
  managerUserId?: string
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
  name?: string
  managerUserId?: string
  isActive?: boolean
}

export interface CreateTeamDto {
  code: string
  name: string
  departmentId: number
  teamLeadUserId?: string
  shift?: string
}

export interface UpdateTeamDto {
  code?: string
  name?: string
  departmentId?: number
  teamLeadUserId?: string
  shift?: string
  isActive?: boolean
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
  email: string
  firstName: string
  lastName: string
  roleId: number
  teamId?: number
  roleInTeam?: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  isActive?: boolean
}

export interface AiExecutionLogDto {
  id: number
  jobName: string
  executedAt: string | null
  status: string
  errorMessage: string | null
}

export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const json = atob(padded)

    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export const getEmailFromJwt = (token: string): string | null => {
  const payload = decodeJwtPayload(token)
  const email = payload?.email

  return typeof email === 'string' && email.trim().length > 0 ? email : null
}
