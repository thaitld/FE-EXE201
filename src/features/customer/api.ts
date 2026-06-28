import { apiClient, type ApiResponse, type PaginatedResult } from '@/lib/api';
import type {
  RegisterCustomerDto,
  SubscriptionPlanDto,
  CreateOrderDto,
  OrderSummaryDto,
  OrderDetailDto,
  CustomerProfileDto,
  UpdateCustomerProfileDto,
  RefundRequestDto,
} from './types';

const unwrap = <T>(response: { data: ApiResponse<T> }) => {
  if (!response.data.succeeded) {
    throw new Error(response.data.message ?? 'Đã xảy ra lỗi hệ thống');
  }
  return response.data.data;
};

export async function registerCustomer(body: RegisterCustomerDto): Promise<{ userId: string }> {
  const response = await apiClient.post<ApiResponse<{ userId: string }>>('/customer/register', body);
  return unwrap(response)!;
}

export async function getPublicPlans(): Promise<SubscriptionPlanDto[]> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlanDto[]>>('/plans');
  return unwrap(response) ?? [];
}

export async function createOrder(body: CreateOrderDto): Promise<{
  orderId: number;
  paymentUrl: string;
  amount: number;
  planName: string;
  billingCycle: string;
}> {
  const response = await apiClient.post<ApiResponse<{
    orderId: number;
    paymentUrl: string;
    amount: number;
    planName: string;
    billingCycle: string;
  }>>('/orders', body);
  return unwrap(response)!;
}

export async function getMyOrders(page = 1, pageSize = 20): Promise<PaginatedResult<OrderSummaryDto>> {
  const response = await apiClient.get<ApiResponse<PaginatedResult<OrderSummaryDto>>>('/orders/my', {
    params: { page, pageSize },
  });
  return unwrap(response) ?? {
    items: [],
    totalCount: 0,
    page: 1,
    pageSize,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };
}

export async function getOrderById(id: number): Promise<OrderDetailDto> {
  const response = await apiClient.get<ApiResponse<OrderDetailDto>>(`/orders/${id}`);
  return unwrap(response)!;
}

export async function cancelOrder(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<any>>(`/orders/${id}`);
  if (!response.data.succeeded) {
    throw new Error(response.data.message ?? 'Không thể hủy đơn hàng');
  }
}

export async function repayOrder(id: number): Promise<{
  orderId: number;
  paymentUrl: string;
  amount: number;
  planName: string;
  billingCycle: string;
}> {
  const response = await apiClient.post<ApiResponse<{
    orderId: number;
    paymentUrl: string;
    amount: number;
    planName: string;
    billingCycle: string;
  }>>(`/orders/${id}/repay`);
  return unwrap(response)!;
}

export async function getMyProfile(): Promise<CustomerProfileDto> {
  const response = await apiClient.get<ApiResponse<CustomerProfileDto>>('/customer/profile');
  return unwrap(response)!;
}

export async function updateMyProfile(body: UpdateCustomerProfileDto): Promise<CustomerProfileDto> {
  const response = await apiClient.put<ApiResponse<CustomerProfileDto>>('/customer/profile', body);
  return unwrap(response)!;
}

export async function requestRefund(orderId: number, reason: string): Promise<RefundRequestDto> {
  const response = await apiClient.post<ApiResponse<RefundRequestDto>>(`/orders/${orderId}/refund-request`, { reason });
  return unwrap(response)!;
}

export async function getMyRefundRequests(): Promise<RefundRequestDto[]> {
  const response = await apiClient.get<ApiResponse<RefundRequestDto[]>>('/orders/my-refund-requests');
  return unwrap(response) ?? [];
}

export async function downloadInvoice(orderId: number): Promise<void> {
  const response = await apiClient.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/html' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `MANTO-Invoice-${String(orderId).padStart(6, '0')}.html`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
