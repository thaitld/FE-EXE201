import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Clock,
  Calculator,
  Loader2,
} from "lucide-react";
import {
  getTaskTypes,
  createTaskType,
  updateTaskType,
  deactivateTaskType,
  getStandardTimes,
  createStandardTime,
  type ApiResponse,
  type TaskTypeDto,
  type StandardTimeDto,
} from "@/lib/api";
import { usePermission } from "@/features/auth/usePermission";

export function TaskTypesPanel() {
  const { isAdmin, isManager, isHR } = usePermission();
  const isEditable = isAdmin() || isManager() || isHR();

  const [taskTypes, setTaskTypes] = useState<TaskTypeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Create/Edit Task Type Modal
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<"create" | "edit">("create");
  const [selectedType, setSelectedType] = useState<TaskTypeDto | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("DEV");
  const [savingType, setSavingType] = useState(false);

  // Standard Times Modal
  const [timesModalOpen, setTimesModalOpen] = useState(false);
  const [times, setTimes] = useState<StandardTimeDto[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [selectedTypeIdForTimes, setSelectedTypeIdForTimes] = useState<number | null>(null);

  // Add Standard Time Version Form
  const [addTimeOpen, setAddTimeOpen] = useState(false);
  const [observedTime, setObservedTime] = useState<number>(10);
  const [ratingFactor, setRatingFactor] = useState<number>(1.0);
  const [pfdFactor, setPfdFactor] = useState<number>(0.15);
  const [savingTime, setSavingTime] = useState(false);

  // Calculate StandardTime dynamically
  const calculatedStandardTime = (observedTime * ratingFactor * (1 + pfdFactor)).toFixed(2);

  const loadTaskTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTaskTypes();
      if (res.data.succeeded) {
        setTaskTypes(res.data.data ?? []);
      } else {
        setError(res.data.message ?? "Không thể tải danh sách loại công việc.");
      }
    } catch {
      setError("Lỗi kết nối với máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskTypes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleOpenCreateType = () => {
    setSelectedType(null);
    setCode("");
    setName("");
    setCategory("DEV");
    setTypeModalMode("create");
    setTypeModalOpen(true);
  };

  const handleOpenEditType = (type: TaskTypeDto) => {
    setSelectedType(type);
    setCode(type.code);
    setName(type.name);
    setCategory(type.category ?? "DEV");
    setTypeModalMode("edit");
    setTypeModalOpen(true);
  };

  const handleSaveType = async () => {
    if (!name.trim() || (typeModalMode === "create" && !code.trim())) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setSavingType(true);
    try {
      if (typeModalMode === "create") {
        const res = await createTaskType({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          category,
        });
        if (res.data.succeeded) {
          alert("Tạo loại công việc thành công!");
          setTypeModalOpen(false);
          loadTaskTypes();
        } else {
          alert(res.data.message || "Tạo thất bại.");
        }
      } else {
        if (!selectedType) return;
        const res = await updateTaskType(selectedType.id, {
          name: name.trim(),
          category,
          isActive: selectedType.isActive,
        });
        if (res.data.succeeded) {
          alert("Cập nhật thành công!");
          setTypeModalOpen(false);
          loadTaskTypes();
        } else {
          alert(res.data.message || "Cập nhật thất bại.");
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi lưu loại công việc.");
    } finally {
      setSavingType(false);
    }
  };

  const handleDeactivateType = async (type: TaskTypeDto) => {
    if (!confirm(`Bạn có chắc muốn tạm dừng loại công việc "${type.name}"?`)) return;
    try {
      const res = await deactivateTaskType(type.id);
      if (res.data.succeeded) {
        alert("Đã tạm dừng công việc thành công.");
        loadTaskTypes();
      } else {
        alert(res.data.message || "Không thể thực hiện.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi kết nối.");
    }
  };

  // Standard Times Handlers
  const handleOpenStandardTimes = async (type: TaskTypeDto) => {
    setSelectedTypeIdForTimes(type.id);
    setTimesModalOpen(true);
    setLoadingTimes(true);
    setAddTimeOpen(false);
    try {
      const res = await getStandardTimes(type.id);
      if (res.data.succeeded) {
        setTimes(res.data.data ?? []);
      }
    } catch {
      setTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleCreateStandardTime = async () => {
    if (!selectedTypeIdForTimes) return;
    setSavingTime(true);
    try {
      const res = await createStandardTime(selectedTypeIdForTimes, {
        observedTime,
        ratingFactor,
        pfdFactor,
      });
      if (res.data.succeeded) {
        alert("Thiết lập định mức thời gian mới thành công!");
        setAddTimeOpen(false);
        // Refresh list
        const refreshed = await getStandardTimes(selectedTypeIdForTimes);
        setTimes(refreshed.data.data ?? []);
        loadTaskTypes(); // Refresh task types list for active status
      } else {
        alert(res.data.message || "Không thể tạo định mức.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi kết nối.");
    } finally {
      setSavingTime(false);
    }
  };

  // Filters logic
  const filteredTypes = taskTypes.filter((t) => {
    const matchesSearch =
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Task Types & IE Standard Times</h2>
            <p className="text-sm text-slate-500">
              Quản lý danh mục loại công việc và định mức thời gian chuẩn IE (Observed Time, Rating, PFDFactor).
            </p>
          </div>
          {isEditable && (
            <button
              type="button"
              onClick={handleOpenCreateType}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 self-start lg:self-center"
            >
              <Plus size={16} /> Thêm loại công việc
            </button>
          )}
        </div>

        {/* Filter controls */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã hoặc tên loại công việc..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50"
          >
            <option value="">Tất cả phân mục (Category)</option>
            {["DEV", "QA", "DESIGN", "HR", "SALES", "MANAGEMENT"].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchTerm("");
                setCategoryFilter("");
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={loadTaskTypes}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
            </button>
          </div>
        </form>
      </section>

      {/* Task Types Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Danh mục loại công việc</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {filteredTypes.length} loại
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Mã loại (Code)</th>
                <th className="px-6 py-3">Tên loại công việc</th>
                <th className="px-6 py-3">Phân mục (Category)</th>
                <th className="px-6 py-3 text-right">Định mức chuẩn (Phút)</th>
                <th className="px-6 py-3 text-center">Trạng thái</th>
                {isEditable && <th className="px-6 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={isEditable ? 6 : 5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filteredTypes.length > 0 ? (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{type.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{type.name}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {type.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      {type.hasActiveStandardTime && type.currentStandardTime !== null ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {type.currentStandardTime.toFixed(2)}m
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          <AlertTriangle size={12} /> Chưa định mức
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          type.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {type.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {type.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isEditable && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenStandardTimes(type)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Calculator size={13} className="text-blue-600" /> Định mức
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditType(type)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Sửa
                          </button>
                          {type.isActive && (
                            <button
                              type="button"
                              onClick={() => handleDeactivateType(type)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                            >
                              Tạm dừng
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isEditable ? 6 : 5} className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy loại công việc nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Task Type Modal (Create / Edit) */}
      {typeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setTypeModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4 border-slate-150">
              {typeModalMode === "create" ? "Thêm loại công việc mới" : "Chỉnh sửa loại công việc"}
            </h3>

            <div className="space-y-4">
              <label className="space-y-1 block">
                <span className="text-xs font-semibold text-slate-600 uppercase">Mã loại (Code) *</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={typeModalMode === "edit"}
                  placeholder="Ví dụ: DEV_BACKEND"
                  className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400 font-mono uppercase disabled:bg-slate-50 disabled:text-slate-500"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-semibold text-slate-600 uppercase">Tên loại công việc *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Lập trình Backend (C#)"
                  className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400 font-semibold"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-semibold text-slate-600 uppercase">Phân mục (Category) *</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2 outline-none focus:border-blue-400"
                >
                  {["DEV", "QA", "DESIGN", "HR", "SALES", "MANAGEMENT"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setTypeModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveType}
                disabled={savingType}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {savingType ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Times Versions Modal */}
      {timesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setTimesModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between border-b pb-3 mb-4 border-slate-150">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Định mức thời gian (IE Standard Times)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Lịch sử định mức và thiết lập định mức thời gian chuẩn mới.</p>
              </div>
              <button
                type="button"
                onClick={() => setTimesModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            {/* Content scroll area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Add new version collapse form */}
              {isEditable && (
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setAddTimeOpen(!addTimeOpen)}
                    className="w-full flex justify-between items-center text-sm font-bold text-slate-800 focus:outline-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <Calculator size={15} className="text-blue-600" /> Thiết lập định mức mới
                    </span>
                    <span className="text-xs text-blue-600 hover:underline">{addTimeOpen ? "Thu gọn" : "Mở rộng"}</span>
                  </button>

                  {addTimeOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                      <label className="space-y-1 block">
                        <span className="text-xs font-semibold text-slate-600 uppercase">Observed Time (phút) *</span>
                        <input
                          type="number"
                          step="0.1"
                          value={observedTime}
                          onChange={(e) => setObservedTime(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400 text-sm"
                        />
                      </label>

                      <label className="space-y-1 block">
                        <span className="text-xs font-semibold text-slate-600 uppercase">Rating Factor *</span>
                        <select
                          value={ratingFactor}
                          onChange={(e) => setRatingFactor(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2 outline-none focus:border-blue-400 text-sm"
                        >
                          <option value="0.8">0.8 - Chậm</option>
                          <option value="1.0">1.0 - Chuẩn</option>
                          <option value="1.2">1.2 - Nhanh</option>
                        </select>
                      </label>

                      <label className="space-y-1 block">
                        <span className="text-xs font-semibold text-slate-600 uppercase">Allowance (PFD Factor) *</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pfdFactor}
                          onChange={(e) => setPfdFactor(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400 text-sm"
                        />
                      </label>

                      <div className="md:col-span-3 flex flex-wrap justify-between items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mt-2">
                        <div className="text-xs text-indigo-700">
                          <p className="font-semibold">Công thức định mức IE chuẩn:</p>
                          <p className="mt-0.5">StandardTime = {observedTime} × {ratingFactor} × (1 + {pfdFactor})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-indigo-500 uppercase font-semibold">Thời gian chuẩn tính toán</p>
                          <p className="text-xl font-extrabold text-indigo-800">{calculatedStandardTime} phút</p>
                        </div>
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setAddTimeOpen(false)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateStandardTime}
                          disabled={savingTime}
                          className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {savingTime ? "Đang lưu..." : "Kích hoạt định mức"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Version History Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                    <History size={13} className="text-slate-500" /> Danh sách các phiên bản
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {times.length} versions
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2">Phiên bản</th>
                        <th className="px-4 py-2 text-right">Thời gian thực tế</th>
                        <th className="px-4 py-2 text-right">Rating</th>
                        <th className="px-4 py-2 text-right">PFD (Allowance)</th>
                        <th className="px-4 py-2 text-right font-bold">Standard Time</th>
                        <th className="px-4 py-2 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {loadingTimes ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Đang tải định mức thời gian...</td>
                        </tr>
                      ) : times.length > 0 ? (
                        times.map((t) => (
                          <tr key={t.id} className={t.isActive ? "bg-emerald-50/20" : "hover:bg-slate-50"}>
                            <td className="px-4 py-2.5 font-semibold text-slate-800">v{t.version}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{t.observedTime.toFixed(1)} phút</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">x{t.ratingFactor.toFixed(1)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{(t.pfdFactor * 100).toFixed(0)}%</td>
                            <td className="px-4 py-2.5 text-right font-bold text-slate-900">{(t.standardTime || 0).toFixed(2)} phút</td>
                            <td className="px-4 py-2.5 text-center">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                  t.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {t.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Chưa có định mức nào được thiết lập.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
