import { useEffect, useState } from "react";
import { getPersonalDashboard, getPersonalBurnoutSignals } from "@/lib/api";
import type {
  PersonalDashboardDto,
  PersonalBurnoutInsightDto,
} from "@/types/employee";

export function usePersonalDashboard() {
  const [dashboard, setDashboard] = useState<PersonalDashboardDto | null>(null);
  const [burnout, setBurnout] = useState<PersonalBurnoutInsightDto | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashResp, burnResp] = await Promise.all([
        getPersonalDashboard(),
        getPersonalBurnoutSignals(),
      ]);

      if (dashResp.data.succeeded) setDashboard(dashResp.data.data);
      if (burnResp.data.succeeded) setBurnout(burnResp.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { dashboard, burnout, loading, error, refetch: fetch };
}
