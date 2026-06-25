import { apiClient, type ApiResponse, type PagedResult } from '@/lib/api';
import type {
  SuperAdminStatsDto,
  OrganizationDto,
  CreateOrganizationDto,
  OrgUserDto,
  SubscriptionHistoryDto,
  ActivateSubscriptionDto,
  ActivateSubscriptionResponseDto,
  RenewSubscriptionDto,
  RenewSubscriptionResponseDto,
  SubscriptionPlanDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  OrderDetailDto,
  FulfillOrderResponseDto,
  RevenueDto,
  PaymentHistoryDto
} from './types';

const unwrap = <T>(response: { data: ApiResponse<T> }) => {
  if (!response.data.succeeded) {
    throw new Error(response.data.message ?? 'Đã xảy ra lỗi hệ thống');
  }
  return response.data.data;
};

export async function getSuperAdminStats(): Promise<SuperAdminStatsDto> {
  const response = await apiClient.get<ApiResponse<SuperAdminStatsDto>>('/super/stats');
  return unwrap(response)!;
}

export async function getOrganizations(page = 1, pageSize = 20): Promise<PagedResult<OrganizationDto>> {
  const response = await apiClient.get<ApiResponse<PagedResult<OrganizationDto>>>('/super/organizations', {
    params: { page, pageSize }
  });
  return unwrap(response) ?? {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };
}

export async function searchOrganizations(search: string, status?: string, page = 1, pageSize = 20): Promise<PagedResult<OrganizationDto>> {
  const response = await apiClient.get<ApiResponse<PagedResult<OrganizationDto>>>('/super/organizations/search', {
    params: { search, status, page, pageSize },
  });
  return unwrap(response) ?? {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };
}

export async function getOrganizationById(id: number): Promise<OrganizationDto> {
  const response = await apiClient.get<ApiResponse<OrganizationDto>>(`/super/organizations/${id}`);
  return unwrap(response)!;
}

export async function createOrganization(body: CreateOrganizationDto): Promise<OrganizationDto> {
  const response = await apiClient.post<ApiResponse<OrganizationDto>>('/super/organizations', body);
  return unwrap(response)!;
}

export async function updateOrganizationStatus(id: number, status: string): Promise<void> {
  await apiClient.patch<ApiResponse<any>>(`/super/organizations/${id}/status`, { status });
}

export async function getOrgUsers(orgId: number): Promise<OrgUserDto[]> {
  const response = await apiClient.get<ApiResponse<OrgUserDto[]>>(`/super/organizations/${orgId}/users`);
  return unwrap(response) ?? [];
}

export async function getOrgSubscriptionHistory(orgId: number): Promise<SubscriptionHistoryDto[]> {
  const response = await apiClient.get<ApiResponse<SubscriptionHistoryDto[]>>(`/super/organizations/${orgId}/subscriptions`);
  return unwrap(response) ?? [];
}

export async function activateSubscription(orgId: number, body: ActivateSubscriptionDto): Promise<ActivateSubscriptionResponseDto> {
  const response = await apiClient.post<ApiResponse<ActivateSubscriptionResponseDto>>(`/super/organizations/${orgId}/activate-subscription`, body);
  return unwrap(response)!;
}

export async function renewSubscription(orgId: number, body: RenewSubscriptionDto): Promise<RenewSubscriptionResponseDto> {
  const response = await apiClient.post<ApiResponse<RenewSubscriptionResponseDto>>(`/super/organizations/${orgId}/renew`, body);
  return unwrap(response)!;
}

export async function getSuperPlans(): Promise<SubscriptionPlanDto[]> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlanDto[]>>('/super/plans');
  return unwrap(response) ?? [];
}

export async function getPlanById(id: number): Promise<SubscriptionPlanDto> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlanDto>>(`/super/plans/${id}`);
  return unwrap(response)!;
}

export async function createPlan(body: CreateSubscriptionPlanDto): Promise<SubscriptionPlanDto> {
  const response = await apiClient.post<ApiResponse<SubscriptionPlanDto>>('/super/plans', body);
  return unwrap(response)!;
}

export async function updatePlan(id: number, body: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanDto> {
  const response = await apiClient.put<ApiResponse<SubscriptionPlanDto>>(`/super/plans/${id}`, body);
  return unwrap(response)!;
}

export async function getOrders(status?: string, planId?: number, page = 1, pageSize = 20): Promise<PagedResult<OrderDetailDto>> {
  const response = await apiClient.get<ApiResponse<PagedResult<OrderDetailDto>>>('/orders', {
    params: { status, planId, page, pageSize },
  });
  return unwrap(response) ?? {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };
}

export async function getOrderById(id: number): Promise<OrderDetailDto> {
  const response = await apiClient.get<ApiResponse<OrderDetailDto>>(`/orders/${id}`);
  return unwrap(response)!;
}

export async function fulfillOrder(id: number): Promise<FulfillOrderResponseDto> {
  const response = await apiClient.post<ApiResponse<FulfillOrderResponseDto>>(`/super/orders/${id}/fulfill`);
  return unwrap(response)!;
}

export async function cancelOrder(id: number, reason: string): Promise<void> {
  await apiClient.delete<ApiResponse<any>>(`/super/orders/${id}`, {
    params: { reason },
  });
}

export async function updateOrderNotes(id: number, notes: string | null): Promise<void> {
  await apiClient.patch<ApiResponse<any>>(`/super/orders/${id}/notes`, { notes });
}

export async function downloadInvoice(orderId: number): Promise<void> {
  const response = await apiClient.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/html' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `invoice_order_${orderId}.html`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function getRevenueStats(year: number): Promise<RevenueDto> {
  const response = await apiClient.get<ApiResponse<RevenueDto>>('/super/revenue', {
    params: { year },
  });
  return unwrap(response)!;
}

export async function getPaymentHistory(orgId?: number): Promise<PaymentHistoryDto[]> {
  const response = await apiClient.get<ApiResponse<PaymentHistoryDto[]>>('/payment/history', {
    params: { orgId },
  });
  return unwrap(response) ?? [];
}

export async function getPublicPlans(): Promise<SubscriptionPlanDto[]> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlanDto[]>>('/plans');
  return unwrap(response) ?? [];
}
