import { useEffect, useState, type FormEvent } from 'react';
import { db } from '@/lib/db';
import type { Department } from '@/types';
import { Button, Card, Modal } from '@/components/ui';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  const load = () => setDepartments(db.listDepartments());

  useEffect(load, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.code) {
      setError('Name and code are required.');
      return;
    }
    if (departments.some((d) => d.code.toLowerCase() === form.code.toLowerCase())) {
      setError('That department code is already in use.');
      return;
    }
    db.createDepartment(form);
    setModalOpen(false);
    setForm({ name: '', code: '', description: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Departments</h1>
          <p className="text-sm text-ink-900/50">Organizational structure</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Department</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 && <p className="text-sm text-ink-900/40">No departments yet.</p>}
        {departments.map((d) => (
          <Card key={d.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-ink-900">{d.name}</h3>
                <p className="text-xs uppercase tracking-wide text-ink-900/40">{d.code}</p>
              </div>
              <span className="rounded-full bg-maroon-50 px-2.5 py-1 text-xs font-medium text-maroon-600">
                {d.employees_count ?? 0} staff
              </span>
            </div>
            {d.description && <p className="mt-2 text-sm text-ink-900/50">{d.description}</p>}
            {d.manager && (
              <p className="mt-3 text-xs text-ink-900/40">Manager: {d.manager.full_name}</p>
            )}
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Department">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Department name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Code (e.g. ENG)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
            rows={3}
          />
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
