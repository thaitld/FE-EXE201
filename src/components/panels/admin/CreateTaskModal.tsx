import { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import {
  getTaskTypes,
  suggestAssignee,
  createTask,
  type TaskTypeDto,
  type AssigneeSuggestionDto,
  type CreateTaskInstanceDto,
  type TeamDetailDto,
  type TeamMemberDto,
} from "@/lib/api";
import { apiClient, type ApiResponse, type UserDto, type PagedResult } from "@/lib/api";
import { usePermission } from "@/features/auth/usePermission";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fitScoreColor(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 60) return "text-blue-700";
  if (score >= 40) return "text-amber-700";
  return "text-rose-700";
}

function fitScoreBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-blue-50 border-blue-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onCreated: () => void;
  defaultTeamId?: number;
}

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Khẩn cấp",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
  CRITICAL: "bg-rose-100 text-rose-800 font-bold",
};

export function CreateTaskModal({ onClose, onCreated, defaultTeamId }: Props) {
  const [taskTypes, setTaskTypes] = useState<TaskTypeDto[]>([]);
  const [employees, setEmployees] = useState<UserDto[]>([]);
  const [suggestions, setSuggestions] = useState<AssigneeSuggestionDto[]>([]);

  const [selectedTypeId, setSelectedTypeId] = useState<number | "">("");
  const [selectedType, setSelectedType] = useState<TaskTypeDto | null>(null);
  const [title, setTitle] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [expectedCompletion, setExpectedCompletion] = useState("");
  const [plannedQuantity, setPlannedQuantity] = useState(1);

  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingSuggest, setIsLoadingSuggest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedTeamId, setDetectedTeamId] = useState<number | undefined>(undefined);

  // Load task types
  useEffect(() => {
    getTaskTypes(true)
      .then((res) => {
        if (res.data.succeeded) setTaskTypes(res.data.data ?? []);
      })
      .finally(() => setIsLoadingTypes(false));
  }, []);

  const { isManager } = usePermission();
  const isManagerUser = isManager();

  // Load employees
  useEffect(() => {
    if (isManagerUser) {
      setIsLoadingEmployees(true);
      apiClient
        .get<ApiResponse<TeamDetailDto[]>>("/teams", {
          params: { isActive: true },
        })
        .then(async (res) => {
          if (res.data.succeeded && res.data.data) {
            const teamsList = res.data.data;
            if (teamsList.length > 0) {
              setDetectedTeamId(teamsList[0].id);
            }
            const allMembersMap = new Map<string, UserDto>();
            
            await Promise.all(
              teamsList.map(async (t) => {
                try {
                  const mRes = await apiClient.get<ApiResponse<TeamMemberDto[]>>(
                    `/teams/${t.id}/members`
                  );
                  if (mRes.data.succeeded && mRes.data.data) {
                    mRes.data.data.forEach((member) => {
                      allMembersMap.set(member.userId, {
                        id: member.userId,
                        email: member.email,
                        firstName: "",
                        lastName: member.userName,
                        isActive: true,
                        roleName: "Employee",
                        teamName: t.name,
                        departmentName: t.departmentName,
                        roleInTeam: member.roleInTeam,
                        createdAt: member.joinedAt ?? "",
                      });
                    });
                  }
                } catch (e) {
                  console.error("Failed to load members for team", t.id, e);
                }
              })
            );
            
            setEmployees(Array.from(allMembersMap.values()));
          }
        })
        .finally(() => setIsLoadingEmployees(false));
    } else {
      apiClient
        .get<ApiResponse<PagedResult<UserDto>>>("/admin/users", {
          params: { role: "Employee", pageSize: 200, isActive: true },
        })
        .then((res) => {
          if (res.data.succeeded) setEmployees(res.data.data?.items ?? []);
        })
        .finally(() => setIsLoadingEmployees(false));
    }
  }, [isManagerUser]);

  // When task type changes — update selectedType
  useEffect(() => {
    if (selectedTypeId === "") {
      setSelectedType(null);
      return;
    }
    const found = taskTypes.find((t) => t.id === Number(selectedTypeId));
    setSelectedType(found ?? null);
    // Reset suggestions
    setSuggestions([]);
    setShowSuggestions(false);
  }, [selectedTypeId, taskTypes]);

  const handleAISuggest = async () => {
    if (!selectedTypeId) return;
    setIsLoadingSuggest(true);
    setSuggestions([]);
    setShowSuggestions(true);
    try {
      const res = await suggestAssignee(
        Number(selectedTypeId),
        defaultTeamId ?? detectedTeamId,
      );
      if (res.data.succeeded) {
        setSuggestions(res.data.data ?? []);
      }
    } catch {
      // ignore — show empty
    } finally {
      setIsLoadingSuggest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!selectedTypeId) return setError("Vui lòng chọn loại task.");
    if (!title.trim()) return setError("Vui lòng nhập tiêu đề task.");
    if (!assignedUserId) return setError("Vui lòng chọn người thực hiện.");
    if (!expectedCompletion) return setError("Vui lòng chọn hạn hoàn thành.");
    if (new Date(expectedCompletion) <= new Date())
      return setError("Hạn hoàn thành phải sau thời điểm hiện tại.");
    if (plannedQuantity < 1 || plannedQuantity > 10000)
      return setError("Số lượng phải từ 1–10000.");

    const dto: CreateTaskInstanceDto = {
      taskTypeId: Number(selectedTypeId),
      title: title.trim(),
      assignedUserId,
      priority,
      expectedCompletion: new Date(expectedCompletion).toISOString(),
      plannedQuantity,
    };

    setIsSubmitting(true);
    try {
      const res = await createTask(dto);
      if (res.data.succeeded) {
        onCreated();
        onClose();
      } else {
        setError(res.data.message ?? "Tạo task thất bại.");
      }
    } catch {
      setError("Lỗi kết nối — vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Tạo Task Mới</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Task Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Loại Task <span className="text-rose-500">*</span>
              </label>
              {isLoadingTypes ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Đang tải...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">-- Chọn loại task --</option>
                    {taskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.name}
                        {t.requiresApproval ? " (cần duyệt)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" />
                </div>
              )}
              {/* Standard Time preview */}
              {selectedType?.activeStandardTime && (
                <div className="mt-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
                  <span className="font-semibold">Thời gian chuẩn:</span>{" "}
                  {selectedType.activeStandardTime.standardTime.toFixed(0)} phút
                  {selectedType.requiresApproval && (
                    <span className="ml-3 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      Cần duyệt
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tiêu đề Task <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Nhập tiêu đề task..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{title.length}/200</p>
            </div>

            {/* Assignee + AI suggest */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Người thực hiện <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAISuggest}
                  disabled={!selectedTypeId || isLoadingSuggest}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingSuggest ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  AI Gợi ý
                </button>
              </div>

              {/* AI Suggestions */}
              {showSuggestions && (
                <div className="mb-2 rounded-xl border border-violet-200 bg-violet-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-600">
                    Gợi ý từ AI
                  </p>
                  {isLoadingSuggest ? (
                    <div className="flex items-center gap-2 text-sm text-violet-600">
                      <Loader2 size={14} className="animate-spin" />
                      Đang phân tích workload, burnout risk...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <p className="text-sm text-slate-500">Không có gợi ý.</p>
                  ) : (
                    <div className="space-y-2">
                      {suggestions.map((s) => (
                        <button
                          key={s.userId}
                          type="button"
                          onClick={() => {
                            setAssignedUserId(s.userId);
                            setShowSuggestions(false);
                          }}
                          className={`w-full rounded-xl border p-3 text-left transition hover:shadow-sm ${fitScoreBg(s.fitScore)} ${assignedUserId === s.userId ? "ring-2 ring-violet-500" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm">
                                {s.rank}
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                {s.userName}
                              </span>
                            </div>
                            <span className={`text-sm font-bold ${fitScoreColor(s.fitScore)}`}>
                              {s.fitScore}/100
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{s.reasoning}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>Task đang chạy: <b>{s.metrics.activeTaskCount}</b></span>
                            <span>Burnout: <b className={
                              s.metrics.burnoutRiskLevel === "HIGH"
                                ? "text-rose-600"
                                : s.metrics.burnoutRiskLevel === "MEDIUM"
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }>{s.metrics.burnoutRiskLevel}</b></span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Manual select */}
              {isLoadingEmployees ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={14} className="animate-spin" /> Đang tải...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {`${emp.firstName} ${emp.lastName}`.trim()} ({emp.email})
                      </option>
                    ))}
                  </select>
                  <User size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" />
                </div>
              )}
            </div>

            {/* Priority + Quantity row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mức độ ưu tiên
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                        priority === p
                          ? PRIORITY_COLORS[p] + " ring-2 ring-offset-1 ring-slate-400"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Số lượng kế hoạch
                </label>
                <input
                  type="number"
                  value={plannedQuantity}
                  onChange={(e) => setPlannedQuantity(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            {/* Expected Completion */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Hạn hoàn thành <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Tạo Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
