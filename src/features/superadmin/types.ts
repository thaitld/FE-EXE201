export interface PlanDistributionDto {
  planName: string;
  count: number;
}

export interface SuperAdminStatsDto {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalRevenue: number;
  expiringIn30Days: number;
  pendingOrders: number;
  planDistribution: PlanDistributionDto[];
}

export interface ActiveSubscriptionDto {
  id: number;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface OrganizationDto {
  id: number;
  name: string;
  slug: string;
  contactEmail: string;
  phone: string | null;
  status: 'Active' | 'Suspended' | 'Cancelled';
  createdAt: string;
  suspendedAt: string | null;
  userCount: number;
  activeSubscription: ActiveSubscriptionDto | null;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  contactEmail: string;
  phone?: string;
}

export interface UpdateOrganizationStatusDto {
  status: 'Active' | 'Suspended' | 'Cancelled';
}

export interface OrgUserDto {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface SubscriptionHistoryDto {
  id: number;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'Active' | 'Cancelled' | 'Expired';
  startDate: string;
  endDate: string;
  createdAt: string;
  daysActive: number;
}

export interface ActivateSubscriptionDto {
  planId: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface ActivateSubscriptionResponseDto {
  subscriptionId: number;
  planName: string;
  startDate: string;
  endDate: string;
  adminEmail: string;
}

export interface RenewSubscriptionDto {
  planId: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export interface RenewSubscriptionResponseDto {
  subscriptionId: number;
  planName: string;
  startDate: string;
  endDate: string;
}

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxDepartments: number;
  maxTeams: number;
  isActive: boolean;
  allowAiFeatures: boolean;
  allowExport: boolean;
  allowCustomSurvey: boolean;
  allowBulkImport: boolean;
  allowKpi: boolean;
  allowAdvancedReports: boolean;
  allowBurnoutDetection: boolean;
  allowGoogleCalendar: boolean;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxDepartments: number;
  maxTeams: number;
  allowAiFeatures: boolean;
  allowExport: boolean;
  allowCustomSurvey: boolean;
  allowBulkImport: boolean;
  allowKpi: boolean;
  allowAdvancedReports: boolean;
  allowBurnoutDetection: boolean;
  allowGoogleCalendar: boolean;
}

export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto> & {
  isActive?: boolean;
};

export interface OrderDetailDto {
  id: number;
  customerEmail: string;
  organizationName: string | null;
  organizationId: number | null;
  planId: number;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  paidAt: string | null;
  notes: string | null;
}

export interface FulfillOrderResponseDto {
  organizationId: number;
  tempPassword: string;
}

export interface MonthlyRevenueDto {
  month: number;
  monthLabel: string;
  amount: number;
  orderCount: number;
}

export interface PlanRevenueDto {
  planName: string;
  amount: number;
  orderCount: number;
}

export interface RevenueDto {
  year: number;
  totalRevenue: number;
  totalOrders: number;
  monthly: MonthlyRevenueDto[];
  byPlan: PlanRevenueDto[];
}

export interface RefundRequestDto {
  id: number;
  orderId: number;
  customerEmail: string;
  customerName: string;
  companyName: string;
  planName: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  paidAt: string | null;
  daysSincePaid: number;
  reviewedAt: string | null;
  reviewedByEmail: string | null;
  reviewNotes: string | null;
}

export interface ReviewRefundRequestDto {
  action: 'APPROVE' | 'REJECT';
  reviewNotes?: string;
}

export interface PaymentHistoryDto {
  id: number;
  organizationName: string;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  currency: string;
  gateway: string;
  gatewayTxnId: string | null;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  paidAt: string | null;
  failureReason: string | null;
}
