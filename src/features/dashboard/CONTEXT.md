# Feature: dashboard

## Purpose
Dashboard panels hiển thị theo role — Performance charts, KPI, Burnout signals.  
Không phải standalone page — được render trong `pages/Dashboard.tsx` theo tab.

## Files
- `EfficiencyChart.tsx` — Biểu đồ hiệu suất dùng Recharts
- `useBurnout.ts` — Hook lấy burnout signals của user hiện tại
- `usePersonalDashboard.ts` — Hook lấy data dashboard cá nhân (Employee)

## API Endpoints Used

| Method | Endpoint | Hook | Dùng để |
|--------|----------|------|---------|
| GET | `/api/dashboard/personal` | `usePersonalDashboard` | Dashboard Employee |
| GET | `/api/dashboard/department/{id}` | — | Dashboard Manager (theo dept) |
| GET | `/api/dashboard/company` | — | Dashboard CEO |
| GET | `/api/burnout/signals/me` | `useBurnout` | Burnout insight cá nhân |

## Dashboard Per Role

| Role | Dashboard Data |
|------|---------------|
| Employee | Personal: hiệu suất hôm qua, task counts, upcoming deadlines, weekly trend |
| Manager | Department: KPI tháng, team breakdown, burnout alerts, monthly trend |
| CEO | Company: so sánh tất cả dept, quarterly trend, AI insights |
| HR | HR view: survey stats, burnout overview, org health |
| Admin | Admin view: user management + system overview |

## Cache TTL (backend xử lý)
- Personal: 5 phút
- Department: 10 phút
- Company: 15 phút

## Personal Dashboard Response Shape
```ts
interface PersonalDashboardDto {
  userId: string;
  userName: string;
  yesterdayEfficiency: number | null;  // 0.0 - 2.0
  efficiencyLabel: string;             // "Xuất sắc" | "Tốt" | "Đạt" | "Cần cải thiện"
  pendingTaskCount: number;
  inProgressTaskCount: number;
  completedThisWeek: number;
  upcomingDeadlines: TaskDeadlineDto[];   // top 5
  weeklyTrend: DailyEfficiencyDto[];      // 7 ngày
  burnoutInsight?: BurnoutInsightDto;     // nếu có risk chưa resolve
}
```

## Efficiency Labels (FE display)
| Ratio | Label | Color |
|-------|-------|-------|
| ≥ 1.10 | Xuất sắc | Green |
| ≥ 0.90 | Tốt | Blue |
| ≥ 0.70 | Đạt | Yellow |
| < 0.70 | Cần cải thiện | Red |
| = 0 | Chưa có dữ liệu | Gray |

## Charts
- Dùng `Recharts` — `LineChart`, `BarChart`, `ResponsiveContainer`
- `EfficiencyChart.tsx` nhận `data: DailyEfficiencyDto[]` và render trend line
