import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CircleCheck,
  CircleX,
  CalendarClock,
  AlertTriangle,
  UserPlus,
  UserX,
  Building2,
} from 'lucide-react';
import { api } from '@/lib/api';

export type NotificationType =
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_pending'
  | 'attendance_late'
  | 'attendance_absent'
  | 'employee_added'
  | 'department_alert';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  /** Only set for leave_rejected — mirrors LeaveRequest.rejection_reason */
  reason?: string;
}

const typeIcons: Record<NotificationType, typeof Bell> = {
  leave_approved: CircleCheck,
  leave_rejected: CircleX,
  leave_pending: CalendarClock,
  attendance_late: AlertTriangle,
  attendance_absent: UserX,
  employee_added: UserPlus,
  department_alert: Building2,
};

const typeColors: Record<NotificationType, string> = {
  leave_approved: 'text-maroon-500 dark:text-maroon-300',
  leave_rejected: 'text-ink-900/60 dark:text-white/60',
  leave_pending: 'text-gold-600 dark:text-gold-400',
  attendance_late: 'text-gold-600 dark:text-gold-400',
  attendance_absent: 'text-maroon-500 dark:text-maroon-300',
  employee_added: 'text-maroon-500 dark:text-maroon-300',
  department_alert: 'text-gold-600 dark:text-gold-400',
};

// ---- Role-specific notification content ----
//
// Each role only sees notifications relevant to what they actually do in
// this system — this mirrors the admin/HR split already enforced by
// RoleRoute: admin never touches leave, HR only touches leave, employees
// only see their own outcomes.
//
// TODO: replace `getMockNotificationsForRole` with a real fetch once the
// backend notifications endpoint exists — e.g.:
//   const data = await api.listNotifications();
// The backend should already scope results to the authenticated user
// (same pattern as /me/employee), so no role-branching would be needed
// on the frontend at that point — this function goes away entirely and
// `notifications` gets set directly from the response.
//
// These arrays are intentionally left empty for now — the bell, badge,
// dropdown, and "mark all read" logic all still work, they just have
// nothing to show until real data is wired in.

interface BackendNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const mapNotification = (n: BackendNotification): NotificationItem => ({
    id: n.id,
    type: n.type ?? 'leave_pending',
    title: n.title,
    description: n.message,
    time: timeAgo(n.created_at),
    read: n.is_read,
  });

  const loadNotifications = async () => {
    try {
      const data = await api.listNotifications();
      setNotifications(data.map(mapNotification));
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const markOneRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-ink-900/70 transition-colors hover:bg-maroon-50 hover:text-maroon-600 dark:text-white/70 dark:hover:bg-ink-700 dark:hover:text-maroon-300"
      >
        <Bell aria-hidden className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-maroon-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-ink-800">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-ink-900/10 bg-white shadow-lg dark:border-white/10 dark:bg-ink-800">
          <div className="flex items-center justify-between border-b border-gold-300 px-4 py-3 dark:border-ink-700">
            <h3 className="font-display text-sm font-bold text-ink-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-maroon-600 hover:underline dark:text-maroon-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-900/40 dark:text-white/40">
                No notifications right now.
              </li>
            )}
            {notifications.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <li
                  key={n.id}
                    className={`flex cursor-pointer gap-3 border-b border-ink-900/5 px-4 py-3 last:border-b-0 dark:border-white/5 ${
                    n.read ? '' : 'bg-maroon-50/50 dark:bg-maroon-500/10'
                  }`}
                  onClick={() => !n.read && markOneRead(n.id)}
                >
                  <Icon aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${typeColors[n.type]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink-900 dark:text-white">{n.title}</p>
                      {!n.read && (
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-900/60 dark:text-white/60">{n.description}</p>
                    {n.reason && (
                      <p className="mt-1 rounded bg-ink-900/5 px-2 py-1 text-xs italic text-ink-900/70 dark:bg-white/5 dark:text-white/70">
                        <span className="font-semibold not-italic">Reason: </span>
                        {n.reason}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-ink-900/35 dark:text-white/35">{n.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}