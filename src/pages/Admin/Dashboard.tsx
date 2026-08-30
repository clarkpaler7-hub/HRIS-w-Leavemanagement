import { useEffect, useState } from 'react';
import { Users, Building2, UserX, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui';
import { GreetingBanner } from '@/components/Greetingbanner';

export default function Dashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
          const [emps, att] = await Promise.all([
            api.listEmployees(),
            api.listAttendance(),
          ]);
        setEmployees(emps);
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

  // Group employees by department
  const departmentMap: Record<string, number> = {};
  employees.forEach((emp) => {
    const dept = emp.department || 'No Department';
    departmentMap[dept] = (departmentMap[dept] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <GreetingBanner
        name={api.currentUser()?.name}
        subtitle="Here's your organization overview for today"
        stats={[
          { label: 'Present', value: presentToday },
          { label: 'Absent', value: absentToday },
          { label: 'Employees', value: employees.filter((e) => e.status === 'active').length },
        ]}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Employees" value={employees.filter((e) => e.status === 'active').length} icon={Users} />
        <StatCard label="Departments" value={Object.keys(departmentMap).length} icon={Building2} />
        <StatCard label="Today's Absent" value={absentToday} icon={UserX} />
        <StatCard label="Today's Present" value={presentToday} icon={UserCheck} />
      </div>
    </div>
  );
}