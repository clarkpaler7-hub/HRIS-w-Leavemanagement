import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Button, Card, Modal, StatusBadge } from '@/components/ui';
import { Building2, ArrowLeft } from 'lucide-react';

export default function DepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', manager_id: '' });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getDepartment(Number(id));
      setDepartment(data);
    } catch (err) {
      console.error('Failed to load department', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await api.listEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  useEffect(() => {
    load();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEditModal = () => {
    if (!department) return;
    setForm({
      name: department.name,
      description: department.description ?? '',
      manager_id: department.manager?.id ? String(department.manager.id) : '',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    try {
      await api.updateDepartment(Number(id), {
        name: form.name,
        description: form.description || undefined,
        manager_id: form.manager_id ? Number(form.manager_id) : null,
      });
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to update department.');
    }
  };

  if (loading) {
    return <p className="text-sm text-ink-900/40">Loading department...</p>;
  }

  if (!department) {
    return <p className="text-sm text-ink-900/40">Department not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">{department.name}</h1>
          {department.description && (
            <p className="text-sm text-ink-900/50">{department.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/departments')}>
            <ArrowLeft className="mr-1 inline h-4 w-4" aria-hidden />
            Back
          </Button>
          <Button onClick={openEditModal}>Edit Department</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-maroon-50">
            <Building2 className="h-6 w-6 text-maroon-500" aria-hidden />
          </div>
          <h2 className="mt-3 font-display text-lg font-bold text-ink-900">{department.name}</h2>
          <p className="text-sm text-ink-900/50">
            Manager: {department.manager?.full_name ?? 'Unassigned'}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-3 text-sm">
            <span className="text-ink-900/60">Employees</span>
            <span className="font-medium text-ink-900">{department.employees?.length ?? 0}</span>
          </div>
        </Card>

        <Card className="p-0 lg:col-span-2">
          <div className="border-b border-ink-900/10 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink-900">Employees</h2>
            <p className="text-sm text-ink-900/50">
              {department.employees?.length ?? 0} employee
              {department.employees?.length === 1 ? '' : 's'} in this department
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-900/10 text-sm">
              <thead className="bg-[#faf9f7] text-left text-xs font-semibold uppercase text-ink-900/50">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {(!department.employees || department.employees.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-ink-900/40">
                      No employees assigned to this department yet.
                    </td>
                  </tr>
                )}
                {department.employees?.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-maroon-50/40">
                    <td className="flex items-center gap-2.5 px-4 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon-500 text-xs font-semibold text-white">
                        {emp.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <span className="font-medium text-ink-900">{emp.full_name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-900/70">{emp.position ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-900/70">{emp.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={emp.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Department">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Department name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            rows={3}
          />
          <select
            value={form.manager_id}
            onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          >
            <option value="">No manager assigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-maroon-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
