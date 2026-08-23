import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, StatCard, StatusBadge } from '@/components/ui';

export default function StaffDashboard() {
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const user = api.currentUser();
  const PRIMARY_LEAVE_TYPES = ['Vacation Leave', 'Sick Leave', 'Mandatory/Forced Leave', 'Special Privilege Leave'];

  useEffect(() => {
    const load = async () => {
      try {
        const [balances, requests, attendance] = await Promise.all([
          api.listLeaveBalances(),
          api.listLeaveRequests(),
          api.listAttendance(),
        ]);

        setLeaveBalances(balances);
        setRecentRequests(requests.slice(0, 5));
        setPendingCount(requests.filter((r: any) => r.status === 'pending').length);

        const today = new Date().toISOString().slice(0, 10);
        const todayRecord = attendance.find((a: any) => a.date === today);
        setTodayAttendance(todayRecord || null);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-ink-900/50">Loading dashboard...</p>;
  }

  const annualLeave = leaveBalances.find((b) => b.leave_type?.name === 'Vacation Leave');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-sm text-ink-900/50">Here's where things stand today</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          label="Today's Status"
          value={
            todayAttendance
              ? todayAttendance.time_out
                ? 'Timed Out'
                : 'Timed In'
              : 'Not Timed In'
          }
          hint={todayAttendance?.time_in ? `In at ${todayAttendance.time_in}` : undefined}
        />
        <StatCard label="Pending Requests" value={pendingCount} />
        <StatCard
          label="Vacation Leave Left"
          value={annualLeave?.remaining_days ?? '—'}
          hint="days remaining"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-600">Leave Balances</h2>

          <ul className="space-y-3">
            {leaveBalances
              .filter((b) => PRIMARY_LEAVE_TYPES.includes(b.leave_type?.name))
              .map((b) => (
                <li key={b.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-900/70">{b.leave_type?.name}</span>
                    <span className="font-medium text-ink-900">
                      {b.remaining_days} / {b.total_days} days left
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/10">
                    <div
                      className="h-full rounded-full bg-gold-400"
                      style={{
                        width: `${b.total_days > 0 ? Math.min(100, (b.used_days / b.total_days) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
          </ul>

          {leaveBalances.some((b) => !PRIMARY_LEAVE_TYPES.includes(b.leave_type?.name)) && (
            <>
              <button
                onClick={() => setShowAllLeaves((prev) => !prev)}
                className="mt-4 text-xs font-medium text-maroon-600 hover:underline"
              >
                {showAllLeaves ? 'Show less' : 'Show all leave types'}
              </button>

              {showAllLeaves && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-900/10 pt-3">
                  {leaveBalances
                    .filter((b) => !PRIMARY_LEAVE_TYPES.includes(b.leave_type?.name))
                    .map((b) => (
                      <div
                        key={b.id}
                        className="rounded-md bg-[#faf9f7] px-2.5 py-1.5 text-xs"
                      >
                        <p className="truncate text-ink-900/60">{b.leave_type?.name}</p>
                        <p className="font-medium text-ink-900">{b.remaining_days} left</p>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-600">
            My Recent Leave Requests
          </h2>
          <ul className="space-y-3">
            {recentRequests.length === 0 && (
              <p className="text-sm text-ink-900/40">You haven't submitted any requests yet.</p>
            )}
            {recentRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-900">{r.leave_type?.name}</p>
                  <p className="text-xs text-ink-900/40">
                    {r.start_date} → {r.end_date} ({r.total_days}d)
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}