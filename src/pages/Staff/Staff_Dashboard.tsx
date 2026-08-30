import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Hourglass, Palmtree, CalendarPlus, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, StatCard, Modal } from '@/components/ui';
import { GreetingBanner } from '@/components/Greetingbanner';
import { AttendanceTrendChart } from '@/components/AttendanceTrendChart';

const statusScore: Record<string, number> = {
  present: 100,
  late: 70,
  half_day: 50,
  on_leave: 50,
  absent: 0,
};

type TrendRange = '7d' | 'monthly' | 'yearly';

function buildTrendData(range: TrendRange, records: any[]): { label: string; value: number }[] {
  const now = new Date();

  if (range === '7d') {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const iso = date.toISOString().slice(0, 10);
      const record = records.find((a) => a.date === iso);
      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
        value: record ? (statusScore[record.status] ?? 0) : 0,
      };
    });
  }

  if (range === 'monthly') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil(daysInMonth / 7);

    return Array.from({ length: weekCount }).map((_, i) => {
      const weekStart = i * 7 + 1;
      const weekEnd = Math.min(weekStart + 6, daysInMonth);
      const weekRecords = records.filter((a) => {
        const d = new Date(a.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() >= weekStart &&
          d.getDate() <= weekEnd
        );
      });
      const avg =
        weekRecords.length > 0
          ? weekRecords.reduce((sum, r) => sum + (statusScore[r.status] ?? 0), 0) / weekRecords.length
          : 0;
      return { label: `W${i + 1}`, value: Math.round(avg) };
    });
  }

  const year = now.getFullYear();
  return Array.from({ length: 12 }).map((_, month) => {
    const monthRecords = records.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const avg =
      monthRecords.length > 0
        ? monthRecords.reduce((sum, r) => sum + (statusScore[r.status] ?? 0), 0) / monthRecords.length
        : 0;
    const label = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short' });
    return { label, value: Math.round(avg) };
  });
}

export default function StaffDashboard() {
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [trendRange, setTrendRange] = useState<TrendRange>('7d');
  const user = api.currentUser();

  useEffect(() => {
    const load = async () => {
      try {
        const [balances, requests, attendance] = await Promise.all([
          api.listLeaveBalances(),
          api.listLeaveRequests(),
          api.listAttendance(),
        ]);

        setLeaveBalances(balances);
        setPendingCount(requests.filter((r: any) => r.status === 'pending').length);
        setAttendanceRecords(attendance);

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

  const trendData = buildTrendData(trendRange, attendanceRecords);

  return (
    <div className="space-y-6">
      <GreetingBanner
        name={user?.name}
        subtitle="Here's where things stand today"
        stats={[
          {
            label: 'Status',
            value: todayAttendance
              ? todayAttendance.time_out
                ? 'Timed Out'
                : 'Timed In'
              : 'Not Timed In',
          },
          { label: 'Pending', value: pendingCount },
          { label: 'Leave Left', value: annualLeave?.remaining_days ?? '—' },
        ]}
      />

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
          icon={Clock}
        />
        <StatCard label="Pending Requests" value={pendingCount} icon={Hourglass} />
        <StatCard
          label="Vacation Leave Left"
          value={annualLeave?.remaining_days ?? '—'}
          hint="days remaining"
          icon={Palmtree}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-600">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/staff_attendance"
              className="flex items-center gap-3 rounded-lg border border-ink-900/10 p-3 transition-colors hover:border-maroon-300 hover:bg-maroon-50/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                <Clock className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink-900">Mark Attendance</span>
                <span className="block text-xs text-ink-900/40">Clock in or out</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-900/30" />
            </Link>

            <Link
              to="/staff_leaverequests"
              className="flex items-center gap-3 rounded-lg border border-ink-900/10 p-3 transition-colors hover:border-maroon-300 hover:bg-maroon-50/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-500/10 text-maroon-600">
                <CalendarPlus className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink-900">Request Leave</span>
                <span className="block text-xs text-ink-900/40">Submit time off</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-900/30" />
            </Link>

            <button
              onClick={() => setShowBalancesModal(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-ink-900/10 p-3 text-left transition-colors hover:border-maroon-300 hover:bg-maroon-50/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-gold-700">
                <Palmtree className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink-900">Leave Balances</span>
                <span className="block text-xs text-ink-900/40">View remaining days</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-900/30" />
            </button>
          </div>
        </Card>

        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-maroon-600">Attendance Trend</h2>
            <div className="flex rounded-lg border border-ink-900/10 p-0.5">
              {(
                [
                  { key: '7d', label: '7 Days' },
                  { key: 'monthly', label: 'Monthly' },
                  { key: 'yearly', label: 'Yearly' },
                ] as const
              ).map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTrendRange(option.key)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    trendRange === option.key
                      ? 'bg-maroon-500 text-white'
                      : 'text-ink-900/50 hover:text-maroon-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <AttendanceTrendChart data={trendData} />
        </Card>
      </div>

      <Modal
        open={showBalancesModal}
        onClose={() => setShowBalancesModal(false)}
        title="Leave Balances"
      >
        <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {leaveBalances.map((b) => (
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
      </Modal>
    </div>
  );
}