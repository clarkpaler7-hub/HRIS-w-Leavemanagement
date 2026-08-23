import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, StatusBadge } from '@/components/ui';


export default function HRLeaveRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.listLeaveRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load leave requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEndorse = async (id: number) => {
    try {
      await api.endorseLeaveRequest(id);
      load();
    } catch (err) {
      console.error('Failed to endorse', err);
    }
  };

  const handleMarkReceived = async (id: number) => {
    try {
      await api.markReceivedLeaveRequest(id);
      load();
    } catch (err) {
      console.error('Failed to mark received', err);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this leave request?')) return;
    try {
      await api.approveLeaveRequest(id);
      load();
    } catch (err) {
      console.error('Failed to approve', err);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this leave request?')) return;
    const remarks = prompt('Enter rejection remarks (optional):') || '';
    try {
      await api.rejectLeaveRequest(id, remarks);
      load();
    } catch (err) {
      console.error('Failed to reject', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Leave Requests</h1>
          <p className="text-sm text-ink-900/50">Track and approve time-off requests</p>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-ink-900/10 text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs font-semibold uppercase text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-900/40">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-900/40">
                  No leave requests yet.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-maroon-50/40">
                <td className="px-4 py-3 font-medium text-ink-900">{r.employee?.full_name}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.leave_type?.name}</td>
                <td className="px-4 py-3 text-ink-900/70">
                  {r.start_date} → {r.end_date}
                </td>
                <td className="px-4 py-3 text-ink-900/70">{r.total_days}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.reason}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleEndorse(r.id)}
                        className="text-xs font-medium text-maroon-600 hover:underline"
                      >
                        Endorse
                      </button>
                    )}
                    {r.status === 'endorsed' && (
                      <button
                        onClick={() => handleMarkReceived(r.id)}
                        className="text-xs font-medium text-maroon-600 hover:underline"
                      >
                        Mark Received
                      </button>
                    )}
                    {r.status === 'for_review' && (
                      <>
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="text-xs font-medium text-maroon-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="text-xs font-medium text-ink-900/60 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}