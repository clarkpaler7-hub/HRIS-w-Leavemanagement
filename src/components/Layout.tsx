import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TccLogo from '@/Images/TccLogo.jpg';
import type { Role } from '@/types';
import { LayoutDashboard, Building2, Users, Clock, CalendarCheck, User } from 'lucide-react';

const adminNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/departments', label: 'Department Management', icon: Building2 },
  { to: '/employees', label: 'Employee Management', icon: Users },
  { to: '/attendance', label: 'Attendance Management', icon: Clock },
];

const employeeNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/Staff_Profile', label: 'My Profile', icon: User  },
  { to: '/Staff_LeaveRequests', label: 'My Leave Requests', icon: CalendarCheck },
  { to: '/Staff_Attendance', label: 'My Attendance', icon: Clock },
];

const hrNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/HRLeaveRequests', label: 'Leave Management', icon: CalendarCheck },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  hr: 'Human Resource',
  employee: 'Employee',
};

function navItemsFor(role: Role) {
  if (role === 'admin') return adminNavItems;
  if (role === 'hr') return hrNavItems;
  return employeeNavItems;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navItems = navItemsFor(user?.role ?? 'employee');

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="flex w-64 shrink-0 flex-col bg-ink-900 text-white">
        <div className="border-b border-gold-500/20 px-6 py-6">
          <div className="flex items-center gap-3">
            <img
              src={TccLogo}
              alt="TccLogo"
              className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-gold-400/40"
            />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide text-white">HRIS</h1> 
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400">
                Tagoloan Community College
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-gold-400 bg-maroon-500 text-white'
                    : 'border-transparent text-white/70 hover:border-gold-500/40 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <item.icon aria-hidden className="h-4 w-4 text-gold-400" />
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gold-500/20 px-4 py-5">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="mb-3 text-xs text-gold-400">{roleLabels[user?.role ?? ''] ?? user?.role}</p>
          <button
            onClick={logout}
            className="w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-gold-400 hover:text-gold-400"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#faf9f7]">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}