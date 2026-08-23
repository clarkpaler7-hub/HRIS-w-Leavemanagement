import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, StatusBadge } from '@/components/ui';

export default function StaffAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.listAttendance();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">My Attendance</h1>
        <p className="text-sm text-ink-900/50">Your attendance is recorded via ZKTeco biometric device</p>
      </div>

      {todayRecord && (
        <div className="rounded-xl border border-ink-900/10 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-ink-900">Today's Record</p>
          <div className="mt-2 flex gap-6 text-sm text-ink-900/70">
            <span>Time In: <strong>{todayRecord.time_in ?? '—'}</strong></span>
            <span>Time Out: <strong>{todayRecord.time_out ?? '—'}</strong></span>
            <span>Late: <strong>{todayRecord.late_minutes} mins</strong></span>
            <span>Status: <strong>{todayRecord.status}</strong></span>
          </div>
        </div>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-ink-900/10 text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs font-semibold uppercase text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time In</th>
              <th className="px-4 py-3">Time Out</th>
              <th className="px-4 py-3">Late (mins)</th>
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
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-900/40">
                  No attendance records yet.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-maroon-50/40">
                <td className="px-4 py-3 text-ink-900/70">{r.date}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.time_in ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.time_out ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.late_minutes}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}