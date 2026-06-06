import { useEffect, useRef, useState } from "react";
import {
  startTimeTracking,
  pauseTimeTracking,
  resumeTimeTracking,
  stopTimeTracking,
  getActiveTimeSession,
} from "@/lib/api";
import type {
  TimeTrackingSessionDto,
  TimeTrackingStopResponseDto,
} from "@/types/employee";

export function useTimeTracking(taskId?: number) {
  const [session, setSession] = useState<TimeTrackingSessionDto | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = async (taskId: number) => {
    try {
      setLoading(true);
      const res = await startTimeTracking(taskId);
      if (res.data.succeeded && res.data.data) {
        const dto = res.data.data;
        setSession({
          sessionId: dto.sessionId,
          taskInstanceId: taskId,
          taskCode: dto.taskCode,
          taskTitle: dto.taskTitle,
          currentAction: "STARTED",
          lastActionAt: dto.startedAt,
          elapsedSeconds: 0,
        } as TimeTrackingSessionDto);
        setElapsedSeconds(0);
        setIsRunning(true);
        setIsPaused(false);
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pause = async (taskId: number) => {
    if (!session) return null;
    try {
      setLoading(true);
      const res = await pauseTimeTracking(taskId, session.sessionId);
      if (res.data.succeeded && res.data.data) {
        setIsRunning(false);
        setIsPaused(true);
      }
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resume = async (taskId: number) => {
    if (!session) return null;
    try {
      setLoading(true);
      const res = await resumeTimeTracking(taskId, session.sessionId);
      if (res.data.succeeded && res.data.data) {
        setIsRunning(true);
        setIsPaused(false);
      }
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stop = async (taskId: number, note?: string) => {
    if (!session) return null;
    try {
      setLoading(true);
      const res = await stopTimeTracking(taskId, session.sessionId, note);
      if (res.data.succeeded && res.data.data) {
        const dto = res.data.data as TimeTrackingStopResponseDto;
        setIsRunning(false);
        setIsPaused(false);
        setElapsedSeconds(dto.cumulativeDurationSeconds);
        // clear session
        setSession(null);
      }
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    try {
      setLoading(true);
      const res = await getActiveTimeSession();
      if (res.data.succeeded) {
        const s = res.data.data;
        if (s && (taskId === undefined || s.taskInstanceId === taskId)) {
          setSession(s);
          setElapsedSeconds(s.elapsedSeconds || 0);
          const action = s.currentAction?.toUpperCase() || "";
          setIsRunning(
            action === "STARTED" ||
            action === "RESUMED" ||
            action === "START" ||
            action === "RESUME"
          );
          setIsPaused(
            action === "PAUSED" ||
            action === "PAUSE"
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000) as unknown as number;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    void restore();
  }, [taskId]);

  const format = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return {
    session,
    elapsedSeconds,
    isRunning,
    isPaused,
    loading,
    start,
    pause,
    resume,
    stop,
    restore,
    timeLabel: format(elapsedSeconds),
  };
}
