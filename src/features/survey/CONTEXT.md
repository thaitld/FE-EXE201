# Feature: survey

## Purpose
Khảo sát hàng tháng về tinh thần và mức độ căng thẳng của nhân viên.  
**Business constraint cứng: 1 user chỉ submit 1 lần/tháng.**

## Files
- `useSurveyStatus.ts` — Hook kiểm tra đã submit tháng này chưa + lấy lịch sử

## API Endpoints Used

| Method | Endpoint | Dùng để |
|--------|----------|---------|
| GET | `/api/survey/status` | Kiểm tra đã submit tháng này chưa |
| POST | `/api/survey` | Submit khảo sát |
| GET | `/api/survey/history` | Lịch sử các tháng trước |

## Request DTO (POST /api/survey)
```ts
interface SurveySubmitDto {
  moraleScore: number;  // 1-5 (1=Rất thấp, 5=Rất cao)
  stressScore: number;  // 1-5 (1=Rất thấp, 5=Rất cao)
  comments?: string;    // optional
}
```

## Status Response
```ts
interface SurveyStatusDto {
  hasSubmittedThisMonth: boolean;
  submittedAt: string | null;  // ISO datetime nếu đã submit
  currentMonth: number;
  currentYear: number;
}
```

## Business Rules (CRITICAL)
- **PHẢI check `hasSubmittedThisMonth` trước khi render form submit**
- Nếu đã submit → chỉ hiển thị trạng thái, không cho submit lại
- Backend block ở cả DB UNIQUE constraint + API guard (400 nếu duplicate)
- Score 1-5 cho cả `moraleScore` và `stressScore`

## Routing
- Route: `#/survey` (standalone page, không phải dashboard tab)
- Auth required: ✅ (Employee và tất cả roles)

## Liên quan đến AI
- MoraleScore + StressScore → input cho **BurnoutDetectionJob** (chạy 02:00 UTC hàng ngày)
- Survey > 2 tháng cũ → không tính vào burnout scoring (stale)
- Survey đóng góp vào **MonthlyKPI** (AvgMorale, AvgStress per department)
