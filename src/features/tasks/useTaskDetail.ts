import { useEffect, useState } from "react";
import {
  getTaskDetail,
  getTaskComments,
  getTaskAttachments,
  addTaskComment,
  uploadSubmissionAttachment,
  deleteAttachment,
} from "@/lib/api";
import type {
  TaskInstanceDto,
  TaskCommentDto,
  TaskAttachmentDto,
} from "@/types/employee";

export function useTaskDetail(taskId: number | null) {
  const [task, setTask] = useState<TaskInstanceDto | null>(null);
  const [comments, setComments] = useState<TaskCommentDto[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);

      const [taskRes, commentsRes, attachRes] = await Promise.all([
        getTaskDetail(taskId),
        getTaskComments(taskId),
        getTaskAttachments(taskId),
      ]);

      if (taskRes.data.succeeded) setTask(taskRes.data.data);
      if (commentsRes.data.succeeded) setComments(commentsRes.data.data || []);
      if (attachRes.data.succeeded) setAttachments(attachRes.data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load task detail",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const postComment = async (content: string) => {
    if (!taskId) return null;
    try {
      const res = await addTaskComment(taskId, content);
      if (res.data.succeeded && res.data.data) {
        setComments((s) => [...s, res.data.data as TaskCommentDto]);
        return res.data.data as TaskCommentDto;
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const uploadAttachment = async (file: File) => {
    if (!taskId) return null;
    try {
      const res = await uploadSubmissionAttachment(taskId, file);
      if (res.data.succeeded && res.data.data) {
        setAttachments((s) => [...s, res.data.data as TaskAttachmentDto]);
        return res.data.data as TaskAttachmentDto;
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeAttachment = async (attachmentId: number) => {
    if (!taskId) return false;
    try {
      const res = await deleteAttachment(taskId, attachmentId);
      if (res.data.succeeded) {
        setAttachments((s) => s.filter((a) => a.id !== attachmentId));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    task,
    comments,
    attachments,
    loading,
    error,
    refetch: fetchAll,
    postComment,
    uploadAttachment,
    removeAttachment,
  };
}
