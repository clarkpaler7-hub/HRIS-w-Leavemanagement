import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, RejectionReasonModal, StatusBadge } from '@/components/ui';
import { AlertCircle } from 'lucide-react';


export default function HRLeaveRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonModal, setReasonModal] = useState<string | null>(null);

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

  const [confirmTarget, setConfirmTarget] = useState<{
    id: number;
    action: 'approve' | 'reject';
    employeeName: string;
  } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openConfirm = (id: number, action: 'approve' | 'reject', employeeName: string) => {
    setRemarks('');
    setConfirmTarget({ id, action, employeeName });
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setRemarks('');
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    setSubmitting(true);
    try {
      if (confirmTarget.action === 'approve') {
        await api.approveLeaveRequest(confirmTarget.id, remarks || undefined);
      } else {
        await api.rejectLeaveRequest(confirmTarget.id, remarks || undefined);
      }
      closeConfirm();
      load();
    } catch (err) {
      console.error('Failed to update leave request', err);
    } finally {
      setSubmitting(false);
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
                  {r.status === 'rejected' && r.hr_remarks ? (
                    <button onClick={() => setReasonModal(r.hr_remarks)} className="cursor-pointer">
                      <StatusBadge status={r.status} />
                    </button>
                  ) : (
                    <StatusBadge status={r.status} />
                  )}
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
                          onClick={() => openConfirm(r.id, 'approve', r.employee?.full_name)}
                          className="text-xs font-medium text-maroon-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openConfirm(r.id, 'reject', r.employee?.full_name)}
                          className="text-xs font-medium text-ink-900/60 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <RejectionReasonModal
                      open={!!reasonModal}
                      onClose={() => setReasonModal(null)}
                      reason={reasonModal ?? ''}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
        {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-sm rounded-lg border-t-4 border-t-gold-400 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                confirmTarget.action === 'approve' ? 'border-maroon-500' : 'border-ink-900'
              }`}
            >
              <AlertCircle
                className={`h-6 w-6 ${
                  confirmTarget.action === 'approve' ? 'text-maroon-500' : 'text-ink-900'
                }`}
                strokeWidth={2}
              />
            </div>

            <h2 className="mb-2 font-display text-xl font-bold text-ink-900">
              {confirmTarget.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </h2>

            <p className="mb-4 text-sm text-ink-900/60">
              Are you sure you wish to {confirmTarget.action}{' '}
              <span className="font-medium text-ink-900">{confirmTarget.employeeName}</span>'s
              leave request?
            </p>

            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                confirmTarget.action === 'approve'
                  ? 'Remarks (optional)'
                  : 'Reason for rejection (optional)'
              }
              rows={2}
              className="mb-4 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm focus:border-maroon-400 focus:outline-none"
            />

            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant={confirmTarget.action === 'reject' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1"
              >
                {submitting
                  ? 'Processing...'
                  : confirmTarget.action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={closeConfirm}
                disabled={submitting}
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}