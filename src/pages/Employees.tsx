import { useEffect, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { EmploymentType } from '@/types';
import { Button, Card, Modal, StatusBadge } from '@/components/ui';

const emptyForm = {
  employee_number: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  name: '',
  email: '',
  password: 'password123',
  position: '',
  department: '',
  date_hired: '',
  hourly_rate: '',
  daily_rate: '',
  employment_type: 'full_time' as EmploymentType,
};

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    try {
      const data = await api.listEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.full_name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.employee_number?.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createEmployee({
        name: form.first_name + ' ' + form.last_name,
        email: form.email,
        password: form.password,
        employee_number: form.employee_number,
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name,
        position: form.position,
        department: form.department,
        date_hired: form.date_hired,
        hourly_rate: form.hourly_rate,
        daily_rate: form.daily_rate,
      });
      setModalOpen(false);
      setForm(emptyForm);
      loadEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Employees</h1>
          <p className="text-sm text-ink-900/50">Manage your workforce</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Employee</Button>
      </div>

      <input
        placeholder="Search by name, email, or employee no…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-md border border-ink-900/15 px-3 py-2 text-sm focus:border-maroon-500 focus:outline-none focus:ring-1 focus:ring-maroon-500"
      />

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-ink-900/10 text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs font-semibold uppercase text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Date Hired</th>
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
            {!loading && filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-900/40">
                  No employees found.
                </td>
              </tr>
            )}
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-maroon-50/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-900">{emp.full_name}</p>
                  <p className="text-xs text-ink-900/40">{emp.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-900/70">{emp.position ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{emp.department ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{emp.date_hired}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={emp.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Employee">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Employee No."
              value={form.employee_number}
              onChange={(e) => setForm({ ...form, employee_number: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              placeholder="Middle name"
              value={form.middle_name}
              onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="col-span-2 rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Hourly Rate"
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Daily Rate"
              value={form.daily_rate}
              onChange={(e) => setForm({ ...form, daily_rate: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              type="date"
              value={form.date_hired}
              onChange={(e) => setForm({ ...form, date_hired: e.target.value })}
              className="col-span-2 rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-maroon-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}