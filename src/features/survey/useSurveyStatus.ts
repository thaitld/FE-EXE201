import { useEffect, useState } from "react";
import { getSurveyStatus, getSurveyHistory, submitSurvey } from "@/lib/api";
import type {
  SurveyStatusDto,
  SurveyHistoryDto,
  SurveySubmitRequestDto,
} from "@/types/employee";

export function useSurveyStatus() {
  const [status, setStatus] = useState<SurveyStatusDto | null>(null);
  const [history, setHistory] = useState<SurveyHistoryDto[]>([]);
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
      if (hRes.data.succeeded) setHistory(hRes.data.data || []);
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
