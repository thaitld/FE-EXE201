import { Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";

interface AlertBellProps {
  onOpenNotifications?: () => void;
}

export default function AlertBell({ onOpenNotifications }: AlertBellProps) {
  const { unreadCount } = useNotificationStore();

  return (
    <button
      type="button"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
      onClick={onOpenNotifications}
      aria-label="Notifications"
    >
      <Bell size={18} />
      {unreadCount > 0 ? (
        <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold leading-none text-white">
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
