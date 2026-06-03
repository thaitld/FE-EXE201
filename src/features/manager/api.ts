import { apiClient, type ApiResponse } from '@/lib/api'
import type {
  BulkCreateResultDto,
  CloneTaskResponseDto,
  CreateDepartmentDto,
  CreateStandardTimeDto,
  CreateTaskInstanceDto,
  CreateTaskTypeDto,
  CreateTeamDto,
  DepartmentDashboardDto,
  DepartmentDto,
  ManagerActionResultDto,
  ManagerReportDto,
  ManagerTaskListFilter,
  OvertimeReportDto,
  ResolveBurnoutDto,
  SurveyAggregationDto,
  SurveyResponseRateDto,
  TaskInstanceDto,
  TaskTypeDto,
  TeamDetailDto,
  TeamPerformanceDto,
  UpdateDepartmentDto,
  UpdateTaskInstanceDto,
  UpdateTaskTypeDto,
  UpdateTeamDto,
  UpdateWorkScheduleDto,
  WorkScheduleDto,
  BurnoutSignalDto,
} from './types'

const unwrap = <T>(response: ApiResponse<T>) => {
  if (!response.succeeded) {
    throw new Error(response.message ?? 'Request failed')
  }
  return response.data
}

export async function getDepartmentDashboard(deptId: number, year: number, month: number) {
  const response = await apiClient.get<ApiResponse<DepartmentDashboardDto>>(`/dashboard/department/${deptId}`, {
    params: { year, month },
  })
  return unwrap(response.data)
}

export async function listDepartments() {
  const response = await apiClient.get<ApiResponse<DepartmentDto[]>>('/departments')
  return unwrap(response.data) ?? []
}

export async function createDepartment(body: CreateDepartmentDto) {
  const response = await apiClient.post<ApiResponse<DepartmentDto>>('/departments', body)
  return unwrap(response.data)
}

export async function updateDepartment(id: number, body: UpdateDepartmentDto) {
  const response = await apiClient.put<ApiResponse<DepartmentDto>>(`/departments/${id}`, body)
  return unwrap(response.data)
}

export async function listTeams(params?: { departmentId?: number; isActive?: boolean }) {
  const response = await apiClient.get<ApiResponse<TeamDetailDto[]>>('/teams', { params })
  return unwrap(response.data) ?? []
}

export async function createTeam(body: CreateTeamDto) {
  const response = await apiClient.post<ApiResponse<TeamDetailDto>>('/teams', body)
  return unwrap(response.data)
}

export async function updateTeam(id: number, body: UpdateTeamDto) {
  const response = await apiClient.put<ApiResponse<TeamDetailDto>>(`/teams/${id}`, body)
  return unwrap(response.data)
}

export async function getWorkSchedule(teamId: number) {
  const response = await apiClient.get<ApiResponse<WorkScheduleDto>>(`/teams/${teamId}/schedule`)
  return unwrap(response.data)
}

export async function updateWorkSchedule(teamId: number, body: UpdateWorkScheduleDto) {
  const response = await apiClient.put<ApiResponse<WorkScheduleDto>>(`/teams/${teamId}/schedule`, body)
  return unwrap(response.data)
}

export async function deleteWorkSchedule(teamId: number) {
  const response = await apiClient.delete<ApiResponse<ManagerActionResultDto>>(`/teams/${teamId}/schedule`)
  return unwrap(response.data)
}

export async function listManagerTasks(params?: ManagerTaskListFilter) {
  const response = await apiClient.get<ApiResponse<{ items: TaskInstanceDto[] }>>('/tasks', { params })
  return unwrap(response.data)
}

export async function getTaskById(id: number) {
  const response = await apiClient.get<ApiResponse<TaskInstanceDto>>(`/tasks/${id}`)
  return unwrap(response.data)
}

export async function createTask(body: CreateTaskInstanceDto) {
  const response = await apiClient.post<ApiResponse<TaskInstanceDto>>('/tasks', body)
  return unwrap(response.data)
}

export async function bulkCreateTasks(body: { tasks: CreateTaskInstanceDto[] }) {
  const response = await apiClient.post<ApiResponse<BulkCreateResultDto>>('/tasks/bulk', body)
  return unwrap(response.data)
}

export async function updateTask(id: number, body: UpdateTaskInstanceDto) {
  const response = await apiClient.put<ApiResponse<TaskInstanceDto>>(`/tasks/${id}`, body)
  return unwrap(response.data)
}

export async function reassignTask(id: number, body: { newAssignedUserId: string; reason?: string }) {
  const response = await apiClient.patch<ApiResponse<TaskInstanceDto>>(`/tasks/${id}/reassign`, body)
  return unwrap(response.data)
}

export async function approveTask(id: number) {
  const response = await apiClient.patch<ApiResponse<TaskInstanceDto>>(`/tasks/${id}/status`, { status: 'COMPLETED' })
  return unwrap(response.data)
}

export async function rejectTask(id: number, rejectionReason: string) {
  const response = await apiClient.patch<ApiResponse<TaskInstanceDto>>(`/tasks/${id}/status`, {
    status: 'REJECTED',
    rejectionReason,
  })
  return unwrap(response.data)
}

export async function cancelTask(id: number) {
  const response = await apiClient.patch<ApiResponse<TaskInstanceDto>>(`/tasks/${id}/status`, { status: 'CANCELLED' })
  return unwrap(response.data)
}

export async function deleteTask(id: number) {
  const response = await apiClient.delete<ApiResponse<ManagerActionResultDto>>(`/tasks/${id}`)
  return unwrap(response.data)
}

export async function cloneTask(id: number, body: { title?: string; assignedUserId?: string; expectedCompletion?: string; priority?: string }) {
  const response = await apiClient.post<ApiResponse<CloneTaskResponseDto>>(`/tasks/${id}/clone`, body)
  return unwrap(response.data)
}

export async function getTeamTasks(teamId: number) {
  const response = await apiClient.get<ApiResponse<TaskInstanceDto[]>>(`/tasks/team/${teamId}`)
  return unwrap(response.data) ?? []
}

export async function listTaskTypes(isActive = true) {
  const response = await apiClient.get<ApiResponse<TaskTypeDto[]>>('/task-types', { params: { isActive } })
  return unwrap(response.data) ?? []
}

export async function createTaskType(body: CreateTaskTypeDto) {
  const response = await apiClient.post<ApiResponse<TaskTypeDto>>('/task-types', body)
  return unwrap(response.data)
}

export async function updateTaskType(id: number, body: UpdateTaskTypeDto) {
  const response = await apiClient.put<ApiResponse<TaskTypeDto>>(`/task-types/${id}`, body)
  return unwrap(response.data)
}

export async function deactivateTaskType(id: number) {
  const response = await apiClient.patch<ApiResponse<TaskTypeDto>>(`/task-types/${id}/deactivate`)
  return unwrap(response.data)
}

export async function listStandardTimes(taskTypeId: number) {
  const response = await apiClient.get<ApiResponse<unknown[]>>(`/task-types/${taskTypeId}/standard-times`)
  return unwrap(response.data) ?? []
}

export async function getActiveStandardTime(taskTypeId: number) {
  const response = await apiClient.get<ApiResponse<unknown>>(`/task-types/${taskTypeId}/standard-times/active`)
  return unwrap(response.data)
}

export async function createStandardTime(taskTypeId: number, body: CreateStandardTimeDto) {
  const response = await apiClient.post<ApiResponse<unknown>>(`/task-types/${taskTypeId}/standard-times`, body)
  return unwrap(response.data)
}

export async function uploadBriefAttachment(taskId: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  const response = await apiClient.post<ApiResponse<unknown>>(`/tasks/${taskId}/attachments/brief`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(response.data)
}

export async function listTaskAttachments(taskId: number) {
  const response = await apiClient.get<ApiResponse<unknown[]>>(`/tasks/${taskId}/attachments`)
  return unwrap(response.data) ?? []
}

export async function deleteTaskAttachment(taskId: number, attachmentId: number) {
  const response = await apiClient.delete<ApiResponse<ManagerActionResultDto>>(`/tasks/${taskId}/attachments/${attachmentId}`)
  return unwrap(response.data)
}

export async function getTeamPerformance(teamId: number, date?: string) {
  const response = await apiClient.get<ApiResponse<TeamPerformanceDto>>(`/performance/team/${teamId}`, {
    params: date ? { date } : undefined,
  })
  return unwrap(response.data)
}

export async function getUserPerformanceRange(userId: string, from?: string, to?: string) {
  const response = await apiClient.get<ApiResponse<unknown>>(`/performance/users/${userId}`, {
    params: { from, to },
  })
  return unwrap(response.data)
}

export async function getDepartmentPerformanceRange(deptId: number, from?: string, to?: string) {
  const response = await apiClient.get<ApiResponse<unknown>>(`/performance/department/${deptId}`, {
    params: { from, to },
  })
  return unwrap(response.data)
}

export async function listOvertimeReports(teamId: number, from?: string, to?: string) {
  const response = await apiClient.get<ApiResponse<OvertimeReportDto[]>>(`/teams/${teamId}/overtime`, {
    params: { from, to },
  })
  return unwrap(response.data) ?? []
}

export async function listBurnoutSignals(params?: { riskLevel?: string; isResolved?: boolean; page?: number; pageSize?: number }) {
  const response = await apiClient.get<ApiResponse<{ items: BurnoutSignalDto[] }>>('/burnout/signals', { params })
  return unwrap(response.data)
}

export async function getBurnoutSignalByUser(userId: string) {
  const response = await apiClient.get<ApiResponse<BurnoutSignalDto>>(`/burnout/signals/user/${userId}`)
  return unwrap(response.data)
}

export async function getDepartmentBurnoutPatterns(deptId: number) {
  const response = await apiClient.get<ApiResponse<unknown[]>>(`/burnout/patterns/department/${deptId}`)
  return unwrap(response.data) ?? []
}

export async function resolveBurnoutSignal(id: number, body: ResolveBurnoutDto) {
  const response = await apiClient.patch<ApiResponse<ManagerActionResultDto>>(`/burnout/signals/${id}/resolve`, body)
  return unwrap(response.data)
}

export async function getSurveyAggregation(year: number, month: number, departmentId?: number) {
  const response = await apiClient.get<ApiResponse<SurveyAggregationDto>>('/survey/aggregation', {
    params: { year, month, departmentId },
  })
  return unwrap(response.data)
}

export async function getSurveyResponseRate(year: number, month: number) {
  const response = await apiClient.get<ApiResponse<SurveyResponseRateDto>>('/survey/response-rate', {
    params: { year, month },
  })
  return unwrap(response.data)
}

export async function getManagerReport(deptId: number, weekStart: string) {
  const response = await apiClient.get<ApiResponse<ManagerReportDto>>('/manager-report', {
    params: { deptId, weekStart },
  })
  const report = unwrap(response.data) as ManagerReportDto & {
    DepartmentId?: number
    DepartmentName?: string
    WeekStart?: string
    WeekEnd?: string
    WeekLabel?: string
    GeneratedAt?: string
    AiReport?: string
    TeamHealth?: ManagerReportDto['teamHealth']
    Members?: ManagerReportDto['members']
  }

  return {
    departmentId: report.departmentId ?? report.DepartmentId ?? deptId,
    departmentName: report.departmentName ?? report.DepartmentName ?? '',
    weekStart: report.weekStart ?? report.WeekStart ?? weekStart,
    weekEnd: report.weekEnd ?? report.WeekEnd ?? weekStart,
    weekLabel: report.weekLabel ?? report.WeekLabel ?? '',
    generatedAt: report.generatedAt ?? report.GeneratedAt ?? '',
    aiReport: report.aiReport ?? report.AiReport ?? '',
    teamHealth: report.teamHealth ?? report.TeamHealth ?? {
      healthy: 0,
      warning: 0,
      critical: 0,
      total: 0,
    },
    members: report.members ?? report.Members ?? [],
  }
}
