import { useState } from "react";
import { addTaskComment } from "@/lib/api";
import type { TaskCommentDto } from "@/types/employee";
import { notify } from "@/lib/notify";

type Props = {
  taskId: number;
  initialComments?: TaskCommentDto[];
  onCommentAdded?: (c: TaskCommentDto) => void;
};

export default function CommentThread({
  taskId,
  initialComments = [],
  onCommentAdded,
}: Props) {
  const [comments, setComments] = useState<TaskCommentDto[]>(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || text.length > 1000) return;
    try {
      setLoading(true);
      const res = await addTaskComment(taskId, text.trim());
      if (res.data.succeeded && res.data.data) {
        setComments((s) => [...s, res.data.data as TaskCommentDto]);
        onCommentAdded?.(res.data.data as TaskCommentDto);
        setText("");
      } else {
        notify({
          title: "Comment failed",
          message: res.data.message || "Failed to post comment",
          type: "WARNING",
        });
      }
    } catch (err) {
      console.error(err);
      notify({
        title: "Comment error",
        message: "Error posting comment",
        type: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 overflow-auto p-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg p-3 ${c.isOwnComment ? "bg-blue-50 self-end" : "bg-gray-100 self-start"}`}
          >
            <div className="text-sm font-semibold">{c.userName}</div>
            <div className="text-xs text-gray-500">
              {new Date(c.createdAt).toLocaleString()}
            </div>
            <div className="mt-2 text-gray-800">{c.content}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
          rows={2}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
