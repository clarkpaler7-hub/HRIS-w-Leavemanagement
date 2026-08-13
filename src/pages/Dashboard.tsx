import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, StatCard } from '@/components/ui';

export default function Dashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [emps, reqs, att] = await Promise.all([
          api.listEmployees(),
          api.listLeaveRequests(),
          api.listAttendance(),
        ]);
        setEmployees(emps);
        setRequests(reqs);
        setAttendance(att);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-sm text-ink-900/50">Loading dashboard…</p>;

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absentToday = todayAttendance.filter((a) => a.status === 'absent').length;
  const pendingLeave = requests.filter((r) => r.status === 'pending').length;

  // Group employees by department
  const departmentMap: Record<string, number> = {};
  employees.forEach((emp) => {
    const dept = emp.department || 'No Department';
    departmentMap[dept] = (departmentMap[dept] || 0) + 1;
  });
  const employeesByDepartment = Object.entries(departmentMap).map(([name, count]) => ({
    name,
    employees_count: count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">Admin Dashboard</h1>
        <p className="text-sm text-ink-900/50">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Employees" value={employees.filter((e) => e.status === 'active').length} />
        <StatCard label="Departments" value={Object.keys(departmentMap).length} />
        <StatCard label="Pending Leave" value={pendingLeave} />
        <StatCard
          label="Present Today"
          value={presentToday}
          hint={`${absentToday} absent`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-600">
            Employees by Department
          </h2>
          <ul className="space-y-2">
            {employeesByDepartment.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="text-ink-900/70">{d.name}</span>
                <span className="font-medium text-ink-900">{d.employees_count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}