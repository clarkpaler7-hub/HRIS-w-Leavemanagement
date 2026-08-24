import { useEffect, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Modal, RejectionReasonModal, StatusBadge } from '@/components/ui';

export default function StaffLeaveRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [error, setError] = useState<string | null>(null);
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
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const data = await api.listLeaveTypes();
      setLeaveTypes(data);
    } catch (err) {
      console.error('Failed to load leave types', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      setError('Please complete all required fields.');
      return;
    }
    if (form.end_date < form.start_date) {
      setError('End date must be on or after the start date.');
      return;
    }
    try {
      await api.createLeaveRequest({
        leave_type_id: Number(form.leave_type_id),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
      });
      setModalOpen(false);
      setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">My Leave Requests</h1>
          <p className="text-sm text-ink-900/50">Submit and track your own time-off requests</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New Request</Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-ink-900/10 text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs font-semibold uppercase text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-900/40">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-900/40">
                  You haven't submitted any leave requests yet.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-maroon-50/40">
                <td className="px-4 py-3 font-medium text-ink-900">{r.leave_type?.name}</td>
                <td className="px-4 py-3 text-ink-900/70">
                  {r.start_date} → {r.end_date}
                </td>
                <td className="px-4 py-3 text-ink-900/70">{r.total_days}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.reason ?? '—'}</td>
                <td className="px-4 py-3">
                  {r.status === 'rejected' && r.hr_remarks ? (
                    <button onClick={() => setReasonModal(r.hr_remarks)} className="cursor-pointer">
                      <StatusBadge status={r.status} />
                    </button>
                  ) : (
                    <StatusBadge status={r.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Leave Request">
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            required
            value={form.leave_type_id}
            onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            placeholder="Reason (optional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            rows={3}
          />
          {error && <p className="text-sm text-maroon-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
      <RejectionReasonModal
        open={!!reasonModal}
        onClose={() => setReasonModal(null)}
        reason={reasonModal ?? ''}
      />
    </div>
  );
}