import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button, Card, Modal } from '@/components/ui';
import { Building2, Users } from 'lucide-react';

const emptyForm = { id: null as number | null, name: '', description: '', manager_id: '' };

export default function Departments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = async () => {
    try {
      const data = await api.listDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments', err);
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
    loadDepartments();
    loadEmployees();
  }, []);

  const openAddModal = () => {
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setForm({
      id: dept.id,
      name: dept.name,
      description: dept.description ?? '',
      manager_id: dept.manager?.id ? String(dept.manager.id) : '',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || undefined,
      manager_id: form.manager_id ? Number(form.manager_id) : null,
    };

    try {
      if (form.id) {
        await api.updateDepartment(form.id, payload);
      } else {
        await api.createDepartment(payload);
      }
      setModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to save department.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Departments</h1>
          <p className="text-sm text-ink-900/50">Organizational structure</p>
        </div>
        <Button onClick={openAddModal}>+ Add Department</Button>
      </div>

      {loading && <p className="text-sm text-ink-900/40">Loading departments...</p>}
      {!loading && departments.length === 0 && (
        <p className="text-sm text-ink-900/40">No departments yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <Card key={d.id} className="flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-maroon-50">
                <Building2 className="h-5 w-5 text-maroon-500" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-ink-900">{d.name}</h3>
                <p className="text-xs text-ink-900/50">
                  Manager: {d.manager?.full_name ?? 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-900/50">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {d.employees_count ?? 0} employee{d.employees_count === 1 ? '' : 's'}
            </div>

            {d.description && (
              <p className="mt-2 line-clamp-2 text-sm text-ink-900/60">{d.description}</p>
            )}

            <div className="mt-4 flex gap-4 border-t border-ink-900/10 pt-3 text-sm font-medium">
              <button
                onClick={() => navigate(`/departments/${d.id}`)}
                className="text-maroon-600 hover:underline"
              >
                View Details
              </button>
              <button onClick={() => openEditModal(d)} className="text-ink-900/60 hover:underline">
                Edit
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit Department' : 'Add Department'}
      >
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
            <Button type="submit">Save Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
