import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { uploadSubmissionAttachment, updateTaskStatus } from "@/lib/api";
import { notify } from "@/lib/notify";
import {
  UploadCloud,
  Link,
  FileText,
  X,
  Loader2,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  onSubmitted?: () => void;
};

export default function TaskSubmitModal({
  isOpen,
  onClose,
  taskId,
  onSubmitted,
}: Props) {
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => note.trim().length >= 1 && note.trim().length <= 1000;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify({
        title: "Submission",
        message: "Ghi chú nộp bài là bắt buộc (1 - 1000 ký tự)",
        type: "WARNING",
      });
      return;
    }

    try {
      setLoading(true);

      if (file) {
        await uploadSubmissionAttachment(taskId, file);
      }

      const res = await updateTaskStatus(taskId, {
        status: "WAITING_FOR_APPROVAL",
        submissionNote: note.trim(),
        deliverableUrl: url.trim() || undefined,
      });

      if (res.data.succeeded) {
        notify({ title: "Submission", message: "Nộp bài thành công" });
        onSubmitted?.();
        onClose();
      } else {
        notify({
          title: "Submission failed",
          message: res.data.message || "Không thể nộp bài",
          type: "ERROR",
        });
      }
    } catch (err) {
      console.error(err);
      notify({
        title: "Submission error",
        message: "Lỗi xảy ra khi nộp bài",
        type: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Main Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <DialogPanel className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-slate-100 flex flex-col font-sans">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-xl p-1 hover:bg-slate-50 transition active:scale-95"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 leading-snug">
                Nộp kết quả công việc
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng cung cấp đầy đủ thông tin để người quản lý phê duyệt.
              </p>
            </div>
          </div>

          {/* Content / Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-5">
            
            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                Ghi chú nộp bài *
              </label>
              <div className="relative">
                <textarea
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Mô tả ngắn gọn về những gì bạn đã làm hoặc kết quả thu được..."
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition resize-none"
                />
                <div className="absolute bottom-2.5 right-3 text-[10px] font-semibold text-slate-400">
                  {note.length} / 1000
                </div>
              </div>
            </div>

            {/* Deliverable URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Link size={13} className="text-slate-400" />
                Deliverable URL (Link sản phẩm/Code)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Link size={14} />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/... hoặc https://figma.com/..."
                  className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>
            </div>

            {/* Custom Styled File Uploader */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <UploadCloud size={13} className="text-slate-400" />
                Tài liệu đính kèm (Hình ảnh/Báo cáo)
              </label>
              
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl cursor-pointer bg-slate-50/30 hover:bg-indigo-50/10 transition duration-150">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud size={28} className="text-slate-400 mb-2 group-hover:text-indigo-500" />
                    <p className="text-xs font-bold text-slate-700">Nhấp để tải tài liệu lên</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, Word, Excel, JPG, PNG (Tối đa 20MB)</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-snug">{file.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition active:scale-90"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition active:scale-95"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !validate()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200/50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {loading ? "Đang gửi..." : "Gửi kết quả"}
              </button>
            </div>

          </form>

        </DialogPanel>
      </div>
    </Dialog>
  );
}
