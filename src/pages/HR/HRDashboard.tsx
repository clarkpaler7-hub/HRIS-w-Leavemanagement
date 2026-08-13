import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, StatCard, StatusBadge } from '@/components/ui';

export default function HRDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqs, types] = await Promise.all([
          api.listLeaveRequests(),
          api.listLeaveTypes(),
        ]);
        setRequests(reqs);
        setLeaveTypes(types);
      } catch (err) {
        console.error('Failed to load HR dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-sm text-ink-900/50">Loading dashboard…</p>;

  const now = new Date();
  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedThisMonth = requests.filter((r) => r.status === 'approved' && isThisMonth(r.start_date)).length;
  const rejectedThisMonth = requests.filter((r) => r.status === 'rejected' && isThisMonth(r.start_date)).length;

  const byLeaveType = leaveTypes.map((type) => ({
    leave_type: type,
    pending: requests.filter((r) => r.leave_type?.id === type.id && r.status === 'pending').length,
    approved_this_month: requests.filter((r) => r.leave_type?.id === type.id && r.status === 'approved' && isThisMonth(r.start_date)).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">Leave Management</h1>
        <p className="text-sm text-ink-900/50">Review and process time-off requests</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending Requests" value={pendingRequests.length} />
        <StatCard label="Approved This Month" value={approvedThisMonth} />
        <StatCard label="Rejected This Month" value={rejectedThisMonth} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-600">By Leave Type</h2>
          <ul className="space-y-3">
            {byLeaveType.map((row) => (
              <li key={row.leave_type.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-900/70">{row.leave_type.name}</span>
                  <span className="text-xs text-ink-900/40">
                    {row.pending} pending · {row.approved_this_month} approved this month
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-600">Pending Queue</h2>
          <ul className="space-y-3">
            {pendingRequests.length === 0 && (
              <p className="text-sm text-ink-900/40">Nothing waiting on approval right now.</p>
            )}
            {pendingRequests.slice(0, 6).map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-900">{r.employee?.full_name}</p>
                  <p className="text-xs text-ink-900/40">
                    {r.leave_type?.name} · {r.start_date} → {r.end_date} ({r.total_days}d)
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
          {pendingRequests.length > 0 && (
            <Link
              to="/HRLeaveRequests"
              className="mt-4 inline-block text-xs font-medium text-maroon-600 hover:underline"
            >
              Go to Leave Requests →
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}