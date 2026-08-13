import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, StatusBadge } from '@/components/ui';

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const data = await api.listAttendance({ date: today });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">Attendance</h1>
        <p className="text-sm text-ink-900/50">Today's attendance records from ZKTeco device</p>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-ink-900/10 text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs font-semibold uppercase text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time In</th>
              <th className="px-4 py-3">Time Out</th>
              <th className="px-4 py-3">Late (mins)</th>
              <th className="px-4 py-3">Late Deduction</th>
              <th className="px-4 py-3">Status</th>
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
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-900/40">
                  No attendance records for today.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-maroon-50/40">
                <td className="px-4 py-3 font-medium text-ink-900">{r.employee?.full_name}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.date}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.time_in ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.time_out ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{r.late_minutes}</td>
                <td className="px-4 py-3 text-ink-900/70">₱{r.late_deduction}</td>
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