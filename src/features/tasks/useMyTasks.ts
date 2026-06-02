import { useEffect, useState } from "react";
import { getMyTasks, getTasks } from "@/lib/api";
import type { TaskInstanceDto, TaskFilterParams } from "@/types/employee";

export function useMyTasks(initialPage = 1, initialPageSize = 20) {
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  const fetch = async (params?: TaskFilterParams) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getTasks({
        page,
        pageSize,
        status: filter,
        sortBy,
        ...(params || {}),
      });

      if (res.data.succeeded && res.data.data) {
        setTasks(res.data.data.items || []);
        setTotalCount(res.data.data.totalCount || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetch();
  }, [page, pageSize, filter, sortBy]);

  return {
    tasks,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    setPage,
    setPageSize,
    setFilter,
    setSortBy,
    refetch: fetch,
  };
}
