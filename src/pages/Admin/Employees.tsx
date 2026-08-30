import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
  department_id: '',
  date_hired: '',
  employment_type: 'full_time' as EmploymentType,
};

const emptyEditForm = {
  first_name: '',
  last_name: '',
  middle_name: '',
  position: '',
  department_id: '',
  status: 'active',
};

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const loadDepartments = async () => {
    try {
      const data = await api.listDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDepartments();
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
        department_id: form.department_id ? Number(form.department_id) : null,
        date_hired: form.date_hired,
      });
      setModalOpen(false);
      setForm(emptyForm);
      loadEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee.');
    }
  };

  const openEdit = (emp: any) => {
    setEditingEmployee(emp);
    setEditForm({
      first_name: emp.first_name ?? '',
      last_name: emp.last_name ?? '',
      middle_name: emp.middle_name ?? '',
      position: emp.position ?? '',
      department_id: emp.department_id ? String(emp.department_id) : '',
      status: emp.status ?? 'active',
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setEditError(null);
    try {
      await api.updateEmployee(editingEmployee.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        middle_name: editForm.middle_name,
        position: editForm.position,
        department_id: editForm.department_id ? Number(editForm.department_id) : null,
        status: editForm.status,
      });
      setEditModalOpen(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update employee.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
      loadEmployees();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete employee.');
    } finally {
      setDeleting(false);
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-900/40">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-900/40">
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
                <td className="px-4 py-3 text-ink-900/70">{emp.department?.name ?? '—'}</td>
                <td className="px-4 py-3 text-ink-900/70">{emp.date_hired}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={emp.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(emp)}
                      aria-label={`Edit ${emp.full_name}`}
                      title="Edit"
                      className="rounded-md p-1.5 text-ink-900/50 transition-colors hover:bg-maroon-50 hover:text-maroon-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(emp);
                        setDeleteError(null);
                      }}
                      aria-label={`Delete ${emp.full_name}`}
                      title="Delete"
                      className="rounded-md p-1.5 text-ink-900/50 transition-colors hover:bg-maroon-50 hover:text-maroon-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add Employee */}
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
            <select
              required
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
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

      {/* Edit Employee */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit ${editingEmployee?.full_name ?? 'Employee'}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="First name"
              value={editForm.first_name}
              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Last name"
              value={editForm.last_name}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              placeholder="Middle name"
              value={editForm.middle_name}
              onChange={(e) => setEditForm({ ...editForm, middle_name: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Position"
              value={editForm.position}
              onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            />
            <select
              value={editForm.department_id}
              onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {editError && <p className="text-sm text-maroon-600">{editError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
      >
        <p className="text-sm text-ink-900/70">
          Are you sure you want to delete{' '}
          <span className="font-medium text-ink-900">{deleteTarget?.full_name}</span>? This
          action cannot be undone.
        </p>
        {deleteError && <p className="mt-2 text-sm text-maroon-600">{deleteError}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}