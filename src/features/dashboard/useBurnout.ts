import { useEffect, useState } from "react";
import {
  getPersonalBurnoutSignals,
  getPersonalBehavioralPatterns,
} from "@/lib/api";
import type {
  PersonalBurnoutInsightDto,
  BehavioralPatternDto,
} from "@/types/employee";

export function useBurnout() {
  const [insight, setInsight] = useState<PersonalBurnoutInsightDto | null>(
    null,
  );
  const [patterns, setPatterns] = useState<BehavioralPatternDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const [iRes, pRes] = await Promise.all([
        getPersonalBurnoutSignals(),
        getPersonalBehavioralPatterns(),
      ]);
      if (iRes.data.succeeded) setInsight(iRes.data.data);
      if (pRes.data.succeeded) setPatterns(pRes.data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load burnout data",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetch();
  }, []);

  return { insight, patterns, loading, error, refetch: fetch };
}
