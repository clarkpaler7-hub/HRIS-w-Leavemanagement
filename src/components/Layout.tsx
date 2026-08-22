import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TccLogo from '@/Images/TccLogo.jpg';
import type { Role } from '@/types';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  CalendarCheck,
  User,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

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

function navItemsFor(role: Role) {
  if (role === 'admin') return adminNavItems;
  if (role === 'hr') return hrNavItems;
  return employeeNavItems;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navItems = navItemsFor(user?.role ?? 'employee');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-white">
      <aside
        className={`shrink-0 overflow-hidden border-gold-300 bg-gold-50 text-ink-900 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64 border-r' : 'w-0 border-r-0'
        }`}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="border-b border-gold-300 px-6 py-6">
            <div className="flex items-center gap-3">
              <img
                src={TccLogo}
                alt="TccLogo"
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-gold-400/40"
              />
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-ink-900">HRIS</h1>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-700">
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
                      : 'border-transparent text-ink-900/70 hover:border-gold-500/40 hover:bg-white hover:text-ink-900'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <item.icon aria-hidden className="h-4 w-4 text-gold-600" />
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-gold-300 px-4 py-5">
            <p className="text-sm font-medium text-ink-900">{user?.name}</p>
            <button
              onClick={logout}
              className="w-full rounded-md border border-ink-900/15 bg-transparent px-3 py-2 text-sm font-medium text-ink-900/70 transition-colors hover:border-maroon-400 hover:text-maroon-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#faf9f7]">
        <div className="flex items-center gap-3 border-b border-gold-300 bg-white px-6 py-3">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="rounded-md p-2 text-ink-900/70 transition-colors hover:bg-maroon-50 hover:text-maroon-600"
          >
            {sidebarOpen ? (
              <PanelLeftClose aria-hidden className="h-5 w-5" />
            ) : (
              <PanelLeft aria-hidden className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}