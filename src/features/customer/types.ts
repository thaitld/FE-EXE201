export interface RegisterCustomerDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SubscriptionPlanDto {
  id: number;
  name: string;
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
  isActive: boolean;
  description: string;
  createdAt: string;
}

export interface CreateOrderDto {
  planId: number;
  billingCycle: string;     // "MONTHLY" | "YEARLY"
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface OrderSummaryDto {
  id: number;
  planName: string;
  billingCycle: string;
  companyName: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export interface OrderDetailDto {
  id: number;
  planId: number;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  paidAt: string | null;
  companyName: string;
  companyEmail: string;
  companyPhone?: string | null;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  organizationId?: number | null;
  organizationName?: string | null;
  vnpayTxnRef?: string | null;
  paymentUrl?: string | null;
}

export interface CustomerProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
}

export interface UpdateCustomerProfileDto {
  firstName: string;
  lastName: string;
  phone?: string;
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
