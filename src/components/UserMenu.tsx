import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  hr: 'Human Resource',
  employee: 'Employee',
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-md p-1.5 pr-2 text-ink-900/70 transition-colors hover:bg-maroon-50 hover:text-maroon-600 dark:text-white/70 dark:hover:bg-ink-700 dark:hover:text-maroon-300"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon-500 text-sm font-bold text-white">
          {user?.name?.charAt(0).toUpperCase() ?? <UserIcon className="h-4 w-4" />}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-ink-900 dark:text-white">
            {user?.name}
          </span>
          <span className="block text-xs leading-tight text-ink-900/50 dark:text-white/50">
            {roleLabels[user?.role ?? ''] ?? user?.role}
          </span>
        </span>
        <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-ink-900/10 bg-white shadow-lg dark:border-white/10 dark:bg-ink-800">
          <div className="border-b border-gold-300 px-4 py-3 dark:border-ink-700">
            <p className="text-sm font-medium text-ink-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gold-700 dark:text-gold-400">
              {roleLabels[user?.role ?? ''] ?? user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-ink-900/70 transition-colors hover:bg-maroon-50 hover:text-maroon-600 dark:text-white/70 dark:hover:bg-ink-700 dark:hover:text-maroon-300"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}