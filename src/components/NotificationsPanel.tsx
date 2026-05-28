import { useRef, useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, InfoIcon } from "lucide-react";
import {
  useNotificationStore,
  type NotificationDto,
} from "@/stores/notificationStore";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-rose-50 border-rose-200 text-rose-700";
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "low":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle size={16} className="text-rose-600" />;
      case "medium":
        return <AlertCircle size={16} className="text-amber-600" />;
      case "low":
        return <InfoIcon size={16} className="text-emerald-600" />;
      default:
        return <InfoIcon size={16} className="text-slate-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden rounded-l-2xl"
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Notifications
            </h3>
            <p className="text-sm text-slate-500">{unreadCount} unread</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="border-b border-slate-200 px-6 py-3">
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <InfoIcon size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No notifications yet</p>
              <p className="text-sm text-slate-500 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 cursor-pointer transition hover:bg-slate-50 ${
                    notification.severity === "high"
                      ? "border-rose-400"
                      : notification.severity === "medium"
                        ? "border-amber-400"
                        : "border-emerald-400"
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getSeverityIcon(notification.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            notification.severity,
                          )}`}
                        >
                          {notification.severity}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {notification.isRead ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-500 flex-shrink-0 mt-1"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
