import { useEffect, useState } from "react";
import { getTasks } from "@/lib/api";
import type { TaskInstanceDto } from "@/types/employee";

export default function MyTasks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getTasks({
          page,
          pageSize,
          status: filter === "ALL" ? undefined : filter,
        });

        if (res.data.succeeded) {
          setTasks(res.data.data?.items || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page, pageSize, filter]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[
          "ALL",
          "PENDING",
          "IN_PROGRESS",
          "WAITING_FOR_APPROVAL",
          "COMPLETED",
        ].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setPage(1);
            }}
            className={`px-4 py-2 rounded ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {loading && (
        <div className="text-center text-gray-500">Loading tasks...</div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg bg-white p-4 hover:bg-gray-50 cursor-pointer shadow-sm border border-slate-200"
            onClick={() => {
              window.location.hash = `#/admin/task/${task.id}`;
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{task.taskCode}</h3>
                <p className="text-sm text-gray-600">{task.title}</p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {task.status}
                </span>
                <span className="ml-2 inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  {task.priority}
                </span>
              </div>
            </div>
            {task.isOverdue && (
              <div className="mt-2 text-sm text-red-600">Overdue</div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center text-gray-500">No tasks found</div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)} className="px-4 py-2">
          Next
        </button>
      </div>
    </div>
  );
}
