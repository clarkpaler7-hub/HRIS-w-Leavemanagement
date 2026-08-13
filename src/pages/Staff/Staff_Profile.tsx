import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, StatusBadge } from '@/components/ui';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-900/40">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-900">{value}</p>
    </div>
  );
}

export default function Staff_Profile() {
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const user = api.currentUser();

  useEffect(() => {
    const load = async () => {
      try {
        const employees = await api.listEmployees();
        // Find employee linked to current user by email
        const matched = employees.find((e: any) => e.email === user?.email);
        setEmployee(matched || null);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-ink-900/50">Loading profile...</p>;
  }

  if (!employee) {
    return <p className="text-sm text-ink-900/50">No employee record is linked to this account.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">My Profile</h1>
        <p className="text-sm text-ink-900/50">Your personal employment details</p>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between border-b border-ink-900/10 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">{employee.full_name}</h2>
            <p className="text-sm text-ink-900/50">{employee.position ?? 'No position assigned'}</p>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Field label="Employee No." value={employee.employee_number} />
          <Field label="Email" value={employee.email} />
          <Field label="Department" value={employee.department ?? '—'} />
          <Field label="Position" value={employee.position ?? '—'} />
          <Field label="Hire Date" value={employee.date_hired} />
          <Field label="Hourly Rate" value={`₱${employee.hourly_rate}`} />
          <Field label="Daily Rate" value={`₱${employee.daily_rate}`} />
        </div>
      </Card>

      <p className="text-xs text-ink-900/40">
        Need something updated here? Reach out to HR — self-service editing isn't enabled for
        employee accounts.
      </p>
    </div>
  );
}