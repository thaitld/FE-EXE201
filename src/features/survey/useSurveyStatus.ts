import { useEffect, useState } from "react";
import { getSurveyStatus, getSurveyHistory, submitSurvey } from "@/lib/api";
import type {
  SurveyStatusDto,
  SurveyHistoryDto,
  SurveyResponseDto,
  SurveySubmitRequestDto,
} from "@/types/employee";

export function useSurveyStatus() {
  const [status, setStatus] = useState<SurveyStatusDto | null>(null);
  const [history, setHistory] = useState<SurveyResponseDto[]>([]);
  const [avgMorale, setAvgMorale] = useState<number | null>(null);
  const [avgStress, setAvgStress] = useState<number | null>(null);
  const [trend, setTrend] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sRes, hRes] = await Promise.all([
        getSurveyStatus(),
        getSurveyHistory(),
      ]);
      if (sRes.data.succeeded) setStatus(sRes.data.data);
      if (hRes.data.succeeded && hRes.data.data) {
        const data = hRes.data.data;
        const mappedResponses = (data.responses || []).map((r) => ({
          ...r,
          submittedAt: r.createdAt || r.submittedAt,
        }));
        setHistory(mappedResponses);
        setAvgMorale(data.avgMoraleScore);
        setAvgStress(data.avgStressScore);
        setTrend(data.trend);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load survey status",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetch();
  }, []);

  const submit = async (payload: SurveySubmitRequestDto) => {
    try {
      setLoading(true);
      const res = await submitSurvey(payload as any);
      if (res.data.succeeded) {
        await fetch();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { status, history, loading, error, refetch: fetch, submit };
}
