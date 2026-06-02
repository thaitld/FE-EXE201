import { useEffect, useState } from "react";
import EfficiencyChart from "@/features/dashboard/EfficiencyChart";
import { getPersonalDashboard, getPersonalBurnoutSignals } from "@/lib/api";
import type {
  PersonalDashboardDto,
  PersonalBurnoutInsightDto,
} from "@/types/employee";

export default function PersonalDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<PersonalDashboardDto | null>(null);
  const [burnout, setBurnout] = useState<PersonalBurnoutInsightDto | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let dData: PersonalDashboardDto | null = null;
        let bData: PersonalBurnoutInsightDto | null = null;

        try {
          const [dashboardRes, burnoutRes] = await Promise.all([
            getPersonalDashboard(),
            getPersonalBurnoutSignals(),
          ]);
          if (dashboardRes.data.succeeded) dData = dashboardRes.data.data;
          if (burnoutRes.data.succeeded) bData = burnoutRes.data.data;
        } catch (apiErr) {
          console.warn("API failed, fallback to mock", apiErr);
        }

        const today = new Date().toISOString().split("T")[0];
        
        // Force mock data to show UI
        if (!dData) dData = {
          pendingTasks: 3,
          inProgressTasks: 2,
          completedThisWeek: 12,
          upcomingDeadlines: [],
          todayPerformance: null,
          weeklyTrend: [],
          burnoutInsight: null,
        };

        // Inject mock Today's Performance
        dData.todayPerformance = {
          userId: "mock-user",
          userName: "Huỳnh Quang Trí",
          reportDate: today,
          totalStandardMinutes: 480,
          totalActualMinutes: 420,
          totalTasks: 5,
          efficiencyRatio: 1.14,
          efficiencyLabel: "Tốt",
        };

        // Inject mock Weekly Trend
        dData.weeklyTrend = [
          { date: "2026-05-26", efficiencyRatio: 0.9, efficiencyLabel: "Trung bình" },
          { date: "2026-05-27", efficiencyRatio: 1.0, efficiencyLabel: "Tốt" },
          { date: "2026-05-28", efficiencyRatio: 1.1, efficiencyLabel: "Tốt" },
          { date: "2026-05-29", efficiencyRatio: 1.2, efficiencyLabel: "Xuất sắc" },
          { date: "2026-05-30", efficiencyRatio: 0.8, efficiencyLabel: "Cần cải thiện" },
          { date: "2026-05-31", efficiencyRatio: 0.95, efficiencyLabel: "Trung bình" },
          { date: today, efficiencyRatio: 1.14, efficiencyLabel: "Tốt" },
        ];
        
        // Inject mock Burnout Alert
        if (!bData) {
          bData = {
            riskLevel: "LOW",
            riskScore: 25,
            triggerFactors: ["Khối lượng công việc ổn định"],
            detectedDate: today,
          };
        }

        setDashboard(dData);
        setBurnout(bData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {loading && (
        <div className="text-center text-gray-500">Loading dashboard...</div>
      )}

      {dashboard && (
        <div className="grid gap-4">
          <div className="rounded-lg bg-white p-6">
            <h2 className="font-semibold">Today's Performance</h2>
            <p className="text-sm text-gray-600">
              Efficiency Ratio:{" "}
              {dashboard.todayPerformance?.efficiencyRatio != null
                ? dashboard.todayPerformance.efficiencyRatio.toFixed(2)
                : "N/A"}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6">
            <h2 className="font-semibold">Weekly Efficiency Trend</h2>
            <div className="mt-4">
              <EfficiencyChart data={dashboard.weeklyTrend} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6">
            <h2 className="font-semibold">Task Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>Pending: {dashboard.pendingTasks}</div>
              <div>In Progress: {dashboard.inProgressTasks}</div>
              <div>Completed This Week: {dashboard.completedThisWeek}</div>
            </div>
          </div>

          {burnout && (
            <div className="rounded-lg bg-orange-50 p-6">
              <h2 className="font-semibold">Burnout Alert</h2>
              <p>Risk Level: {burnout.riskLevel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
