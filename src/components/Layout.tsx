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
  Menu,
  LogOut,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-white dark:bg-ink-900">
      <aside
        className={`shrink-0 overflow-hidden border-r border-gold-300 bg-gold-50 text-ink-900 transition-all duration-300 ease-in-out dark:border-ink-700 dark:bg-ink-800 dark:text-white ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-gold-300 px-4 py-6 dark:border-ink-700">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <img
                src={TccLogo}
                alt="TccLogo"
                className={`shrink-0 rounded-full object-cover ring-1 ring-gold-400/40 transition-all duration-300 ${
                  sidebarOpen ? 'h-16 w-16' : 'h-10 w-10'
                }`}
              />
              {sidebarOpen && (
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-wide text-maroon-500 dark:text-maroon-300">
                    HRIS
                  </h1>
                  <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-gold-700 dark:text-gold-400">
                    Tagoloan Community College
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={sidebarOpen ? undefined : item.label}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md border-l-2 py-2.5 text-sm font-medium transition-colors ${
                    sidebarOpen ? 'px-3' : 'justify-center px-2'
                  } ${
                    isActive
                      ? 'border-gold-400 bg-maroon-500 text-white'
                      : 'border-transparent text-ink-900/70 hover:border-maroon-400 hover:bg-maroon-500 hover:text-white dark:text-white/70'
                  }`
                }
              >
                <item.icon aria-hidden className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
                {sidebarOpen && item.label}
              </NavLink>
            ))}
          </nav>

          <div
            className={`border-t border-gold-300 px-4 py-5 dark:border-ink-700 ${
              sidebarOpen ? '' : 'flex flex-col items-center px-2'
            }`}
          >
            {sidebarOpen ? (
              <>
                <p className="text-sm font-medium text-ink-900 dark:text-white">{user?.name}</p>
                <p className="mb-3 text-xs text-gold-700 dark:text-gold-400">
                  {roleLabels[user?.role ?? ''] ?? user?.role}
                </p>
                <button
                  onClick={logout}
                  className="w-full rounded-md border border-ink-900/15 bg-transparent px-3 py-2 text-sm font-medium text-ink-900/70 transition-colors hover:border-maroon-400 hover:text-maroon-600 dark:border-white/15 dark:text-white/70 dark:hover:text-maroon-300"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-md border border-ink-900/15 bg-transparent p-2 text-ink-900/70 transition-colors hover:border-maroon-400 hover:text-maroon-600 dark:border-white/15 dark:text-white/70 dark:hover:text-maroon-300"
              >
                <LogOut aria-hidden className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#faf9f7] dark:bg-ink-900">
        <div className="flex items-center border-b border-gold-300 bg-white px-6 py-3 dark:border-ink-700 dark:bg-ink-800">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="rounded-md p-2 text-ink-900/70 transition-colors hover:bg-maroon-50 hover:text-maroon-600 dark:text-white/70 dark:hover:bg-ink-700 dark:hover:text-maroon-300"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}