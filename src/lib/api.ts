import axios from "axios";

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
