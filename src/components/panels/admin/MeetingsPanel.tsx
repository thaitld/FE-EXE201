import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Video,
  MapPin,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link,
  Loader2,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getMyMeetings,
  getMeetings,
  getDepartmentMeetings,
  createMeeting,
  getGoogleCalendarAuthUrl,
  getGoogleCalendarStatus,
  disconnectGoogleCalendar,
  syncGoogleCalendar,
  getMyMeetingLoad,
  apiClient,
  type ApiResponse,
  type MeetingDto,
  type MeetingLoadDto,
  type CreateMeetingDto,
  type DepartmentDto,
  type TeamDetailDto,
} from "@/lib/api";
import { usePermission } from "@/features/auth/usePermission";

export function MeetingsPanel() {
  const { isEmployee, isManager, isHR, isCEO, isAdmin, user } = usePermission();
  const isLeadership = isManager() || isHR() || isCEO() || isAdmin();

  const [scope, setScope] = useState<"me" | "department" | "all">(isLeadership ? "all" : "me");
  const [meetings, setMeetings] = useState<MeetingDto[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDto | null>(null);

  // Range filters
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Calendar Integration State
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalEmail, setGcalEmail] = useState<string | null>(null);
  const [checkingGcal, setCheckingGcal] = useState(false);
  const [syncingGcal, setSyncingGcal] = useState(false);

  // Meeting Load State
  const [meetingLoad, setMeetingLoad] = useState<MeetingLoadDto | null>(null);
  const [loadingLoad, setLoadingLoad] = useState(false);

  // Schedule Meeting Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [deptId, setDeptId] = useState<number | "">("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [participantIdsInput, setParticipantIdsInput] = useState("");
  const [allUsers, setAllUsers] = useState<{ id: string; email: string; firstName: string; lastName: string }[]>([]);
  const [teams, setTeams] = useState<TeamDetailDto[]>([]);
  const [savingMeeting, setSavingMeeting] = useState(false);

  // Fetch departments
  const loadDepartments = async () => {
    try {
      const response = await apiClient.get<ApiResponse<DepartmentDto[]>>("/departments");
      setDepartments(response.data.data ?? []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedDeptId(response.data.data[0].id);
      }
    } catch {
      // Fail silently
    }
  };

  // Fetch all users for scheduler list
  const loadUsersAndTeams = async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        apiClient.get<ApiResponse<any>>("/admin/users?pageSize=1000"), // For list of participants
        apiClient.get<ApiResponse<TeamDetailDto[]>>("/teams"),
      ]);
      setAllUsers(usersRes.data.data?.items ?? []);
      setTeams(teamsRes.data.data ?? []);
    } catch {
      // Fail silently
    }
  };

  // Fetch meetings
  const loadMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let res;
      const startIso = new Date(fromDate + "T00:00:00Z").toISOString();
      const endIso = new Date(toDate + "T23:59:59Z").toISOString();

      if (scope === "me") {
        res = await getMyMeetings(startIso, endIso);
      } else if (scope === "department") {
        if (selectedDeptId === "") return;
        res = await getDepartmentMeetings(Number(selectedDeptId), startIso, endIso);
      } else {
        res = await getMeetings(startIso, endIso);
      }

      if (res.data.succeeded) {
        setMeetings(res.data.data ?? []);
      } else {
        setError(res.data.message ?? "Không thể tải danh sách cuộc họp.");
      }
    } catch {
      setError("Lỗi kết nối với máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Google Calendar Connection Status
  const checkGcalStatus = async () => {
    setCheckingGcal(true);
    try {
      const res = await getGoogleCalendarStatus();
      if (res.data.succeeded && res.data.data) {
        setGcalConnected(res.data.data.isConnected);
        setGcalEmail(res.data.data.email ?? null);
      }
    } catch {
      // Fail silently
    } finally {
      setCheckingGcal(false);
    }
  };

  // Fetch Personal Meeting Load
  const loadPersonalMeetingLoad = async () => {
    setLoadingLoad(true);
    try {
      const res = await getMyMeetingLoad();
      if (res.data.succeeded && res.data.data) {
        setMeetingLoad(res.data.data);
      }
    } catch {
      // Fail silently
    } finally {
      setLoadingLoad(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    checkGcalStatus();
    loadPersonalMeetingLoad();
    loadUsersAndTeams();

    // Check if redirected with status=connected
    const params = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
    if (params.get("status") === "connected") {
      alert("Kết nối Google Calendar thành công!");
      // Clean query params so alert doesn't show again on refresh
      const hashOnly = window.location.hash.split("?")[0];
      window.history.replaceState({}, document.title, window.location.pathname + hashOnly);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [scope, selectedDeptId, fromDate, toDate]);

  // Google Calendar Integration Handlers
  const handleConnectGcal = async () => {
    try {
      const res = await getGoogleCalendarAuthUrl();
      if (res.data.succeeded && res.data.data) {
        window.location.href = res.data.data.authUrl;
      }
    } catch {
      alert("Không lấy được URL kết nối Google Calendar.");
    }
  };

  const handleDisconnectGcal = async () => {
    if (!confirm("Bạn có chắc chắn muốn ngắt kết nối Google Calendar?")) return;
    try {
      const res = await disconnectGoogleCalendar();
      if (res.data.succeeded) {
        setGcalConnected(false);
        setGcalEmail(null);
        alert("Đã ngắt kết nối thành công.");
      } else {
        alert(res.data.message || "Không thể ngắt kết nối.");
      }
    } catch {
      alert("Lỗi khi gửi yêu cầu ngắt kết nối.");
    }
  };

  const handleSyncGcal = async () => {
    setSyncingGcal(true);
    try {
      const res = await syncGoogleCalendar();
      if (res.data.succeeded) {
        alert("Đồng bộ Google Calendar thành công!");
        loadMeetings();
      } else {
        alert(res.data.message || "Đồng bộ thất bại.");
      }
    } catch {
      alert("Lỗi kết nối khi đồng bộ.");
    } finally {
      setSyncingGcal(false);
    }
  };

  // Create Meeting Submit
  const handleCreateMeeting = async () => {
    if (!title.trim() || !startTime || !endTime) {
      alert("Vui lòng điền đầy đủ tiêu đề, thời gian bắt đầu và kết thúc.");
      return;
    }

    setSavingMeeting(true);
    try {
      const pIds = participantIdsInput
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const dto: CreateMeetingDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        location: location.trim() || undefined,
        departmentId: deptId !== "" ? Number(deptId) : undefined,
        teamId: teamId !== "" ? Number(teamId) : undefined,
        participantUserIds: pIds,
      };

      const res = await createMeeting(dto);
      if (res.data.succeeded) {
        alert("Đã đặt lịch cuộc họp thành công!");
        setCreateModalOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setDeptId("");
        setTeamId("");
        setParticipantIdsInput("");
        // Reload list
        loadMeetings();
        loadPersonalMeetingLoad();
      } else {
        alert(res.data.message || "Không thể tạo cuộc họp.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi tạo cuộc họp.");
    } finally {
      setSavingMeeting(false);
    }
  };

  const loadPercentage = meetingLoad ? meetingLoad.meetingLoadRatio * 100 : 0;
  const totalHours = meetingLoad ? meetingLoad.totalMeetingMinutes / 60 : 0;
  const meetingCount = meetingLoad ? meetingLoad.meetings.length : 0;

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Lịch họp & Meetings</h2>
            <p className="text-sm text-slate-500">
              Đặt lịch cuộc họp, sync tự động Google Calendar, theo dõi thời gian họp trong tuần.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Range Datepicker */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-sm">
              <Clock size={16} className="text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold outline-none"
              />
              <span className="text-slate-400">đến</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold outline-none"
              />
            </div>

            {/* Scope select */}
            {isLeadership && (
              <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 text-sm">
                <button
                  type="button"
                  onClick={() => setScope("me")}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                    scope === "me" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Của tôi
                </button>
                <button
                  type="button"
                  onClick={() => setScope("department")}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                    scope === "department" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Phòng ban
                </button>
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                    scope === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả
                </button>
              </div>
            )}

            {/* Department selector */}
            {scope === "department" && (
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {/* Schedule new meeting (CEO, Manager, HR only) */}
            {(isCEO() || isManager() || isHR()) && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={16} /> Đặt lịch họp
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Meetings list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" /> Danh sách cuộc họp
            </h3>

            {isLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : error ? (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CalendarDays size={40} className="mb-2 opacity-30 text-blue-500" />
                <p className="text-sm font-semibold text-slate-600">Không có cuộc họp nào</p>
                <p className="text-xs text-slate-400 mt-1">Không tìm thấy cuộc họp nào trong khoảng thời gian đã chọn.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeeting(m)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-300 hover:shadow-md bg-white flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {m.title}
                      </h4>
                      {m.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {new Date(m.startTime).toLocaleString("vi-VN")} - {new Date(m.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {m.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {m.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User size={13} />
                          Tổ chức: {m.organizerName}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {m.departmentName && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            Phòng: {m.departmentName}
                          </span>
                        )}
                        {m.teamName && (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Nhóm: {m.teamName}
                          </span>
                        )}
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {m.participantCount} người tham gia
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                      {m.meetingLink && (
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          <Video size={13} /> Google Meet
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Google Calendar & Load indicators */}
        <div className="space-y-6">
          {/* Google Calendar card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" /> Google Calendar
            </h3>

            {checkingGcal ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : gcalConnected ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle className="text-emerald-600 shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-800">Đã kết nối lịch biểu</p>
                    <p className="text-xs text-emerald-600 truncate">{gcalEmail}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSyncGcal}
                    disabled={syncingGcal}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={syncingGcal ? "animate-spin" : ""} />
                    Đồng bộ ngay
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGcal}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <XCircle size={13} />
                    Hủy kết nối
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Kết nối tài khoản Google của bạn để tự động đẩy cuộc họp lên Google Calendar và tạo Meet link.
                </p>
                <button
                  type="button"
                  onClick={handleConnectGcal}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <Link size={14} /> Kết nối Google Calendar
                </button>
              </div>
            )}
          </div>

          {/* Meeting Load stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" /> Tần suất họp cá nhân
            </h3>

            {loadingLoad ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : meetingLoad ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {totalHours.toFixed(1)}h
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Tổng thời gian họp tuần này</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">{meetingCount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Cuộc họp</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Tỷ lệ thời gian họp trong tuần</span>
                    <span className="font-bold text-indigo-600">{loadPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        loadPercentage > 60
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                          : loadPercentage > 30
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    />
                  </div>
                  {loadPercentage > 60 && (
                    <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 p-2.5 flex items-start gap-2">
                      <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={14} />
                      <p className="text-[11px] text-rose-700 leading-normal">
                        <strong>Cảnh báo Meeting Overload:</strong> Thời gian họp vượt quá 60% giờ làm việc tiêu chuẩn. Có nguy cơ kiệt sức cao.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Chưa có dữ liệu khảo sát tần suất họp trong tuần này.</p>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setSelectedMeeting(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between border-b pb-3 border-slate-150">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMeeting.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tổ chức bởi: <strong>{selectedMeeting.organizerName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1 text-sm text-slate-700">
              {selectedMeeting.description && (
                <div>
                  <h5 className="font-semibold text-slate-900 mb-1">Mô tả</h5>
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {selectedMeeting.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-semibold text-slate-900 mb-0.5">Thời gian</h5>
                  <p className="text-slate-600">
                    {new Date(selectedMeeting.startTime).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 mb-0.5">Kết thúc</h5>
                  <p className="text-slate-600">
                    {new Date(selectedMeeting.endTime).toLocaleString("vi-VN")}
                  </p>
                </div>
                {selectedMeeting.location && (
                  <div className="col-span-2">
                    <h5 className="font-semibold text-slate-900 mb-0.5">Địa điểm</h5>
                    <p className="text-slate-600 flex items-center gap-1">
                      <MapPin size={12} /> {selectedMeeting.location}
                    </p>
                  </div>
                )}
                {selectedMeeting.meetingLink && (
                  <div className="col-span-2">
                    <h5 className="font-semibold text-slate-900 mb-0.5">Google Meet</h5>
                    <a
                      href={selectedMeeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Video size={12} /> {selectedMeeting.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Participants list */}
              {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                <div>
                  <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600" /> Thành viên tham gia
                  </h5>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-150 overflow-hidden bg-slate-50/50">
                    {selectedMeeting.participants.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2.5 text-xs">
                        <div>
                          <p className="font-semibold text-slate-950">{p.fullName}</p>
                          <p className="text-[10px] text-slate-400">{p.email}</p>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            p.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700"
                              : p.status === "DECLINED"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setCreateModalOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between border-b pb-3 border-slate-150">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Đặt lịch họp mới</h3>
                <p className="text-xs text-slate-500 mt-0.5">Đặt lịch làm việc, họp phòng ban hoặc họp nhóm dự án.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1 text-sm text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="col-span-2 space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Tiêu đề cuộc họp *</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Họp đồng bộ sprint backend"
                    className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Thời gian bắt đầu *</span>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Thời gian kết thúc *</span>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400"
                  />
                </label>

                <label className="space-y-1 col-span-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Địa điểm / Link cuộc họp</span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Phòng họp A2 hoặc bỏ trống"
                    className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Thuộc Phòng ban</span>
                  <select
                    value={deptId}
                    onChange={(e) => {
                      setDeptId(e.target.value === "" ? "" : Number(e.target.value));
                      setTeamId(""); // Reset team selection on dept change
                    }}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2 outline-none focus:border-blue-400"
                  >
                    <option value="">Chọn phòng ban (tùy chọn)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Thuộc Nhóm (Team)</span>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2 outline-none focus:border-blue-400"
                  >
                    <option value="">Chọn nhóm (tùy chọn)</option>
                    {teams
                      .filter((t) => deptId === "" || t.departmentId === Number(deptId))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </label>

                <div className="col-span-2 space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Thành viên tham gia (chọn ID người dùng)</span>
                  <div className="text-slate-400 text-[11px] mb-1">
                    Chọn các thành viên dưới đây (hoặc nhập thủ công dạng GUID phân cách bởi dấu phẩy):
                  </div>
                  <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-wrap gap-1.5">
                    {allUsers.map((u) => {
                      const isSelected = participantIdsInput.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setParticipantIdsInput((prev) =>
                                prev
                                  .split(",")
                                  .map((x) => x.trim())
                                  .filter((x) => x !== u.id)
                                  .join(", ")
                              );
                            } else {
                              setParticipantIdsInput((prev) =>
                                prev ? `${prev}, ${u.id}` : u.id
                              );
                            }
                          }}
                          className={`rounded px-2 py-1 text-[11px] font-semibold border ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-700 text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {u.lastName ?? ""} {u.firstName ?? ""} ({u.email?.split("@")[0] ?? "no-email"})
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={participantIdsInput}
                    onChange={(e) => setParticipantIdsInput(e.target.value)}
                    placeholder="GUID1, GUID2..."
                    className="w-full mt-2 rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400 font-mono text-xs"
                  />
                </div>

                <label className="col-span-2 space-y-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Nội dung họp</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả nội dung cuộc họp..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-250 px-3 py-2 outline-none focus:border-blue-400"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleCreateMeeting}
                  disabled={savingMeeting}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingMeeting ? "Đang lưu..." : "Đặt lịch họp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Quick helper to sync template endTime on startTime change
  function setTemplateEndTime(value: string) {
    setEndTime(value);
  }
}
