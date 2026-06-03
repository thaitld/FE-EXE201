import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { uploadSubmissionAttachment, updateTaskStatus } from "@/lib/api";
import { notify } from "@/lib/notify";

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

  const handleSubmit = async () => {
    if (!validate()) {
      notify({
        title: "Submission",
        message: "Submission note is required (1-1000 chars)",
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
        submissionNote: note,
        deliverableUrl: url || undefined,
      });

      if (res.data.succeeded) {
        notify({ title: "Submission", message: "Nộp bài thành công" });
        onSubmitted?.();
        onClose();
      } else {
        notify({
          title: "Submission failed",
          message: res.data.message || "Submission failed",
          type: "ERROR",
        });
      }
    } catch (err) {
      console.error(err);
      notify({
        title: "Submission error",
        message: "Error submitting task",
        type: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />

        <div className="relative z-10 w-full max-w-lg rounded bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Nộp bài</Dialog.Title>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Deliverable URL (optional)
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                File đính kèm (optional)
              </label>
              <input
                type="file"
                onChange={handleFile}
                className="mt-1 w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2">
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!validate() || loading}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
