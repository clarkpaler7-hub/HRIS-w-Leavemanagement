import { Monitor } from 'lucide-react';
import TccLogo from '@/Images/TccLogo.jpg';
import { useAuth } from '@/context/AuthContext';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  hr: 'Human Resource',
};

export default function DesktopOnlyNotice() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] px-6 text-center dark:bg-ink-900">
      <img
        src={TccLogo}
        alt="TccLogo"
        className="mb-6 h-16 w-16 rounded-full object-cover ring-1 ring-gold-400/40"
      />

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-maroon-500">
        <Monitor className="h-7 w-7 text-maroon-500" strokeWidth={2} />
      </div>

      <h1 className="mt-5 font-display text-xl font-bold text-ink-900 dark:text-white">
        Please Use a Desktop
      </h1>

      <p className="mt-2 max-w-xs text-sm text-ink-900/60 dark:text-white/60">
        {roleLabels[user?.role ?? ''] ?? 'This'} accounts can only access the HRIS dashboard from a
        desktop or laptop computer. Please sign in from a computer to continue.
      </p>

      <button
        onClick={logout}
        className="mt-6 rounded-md border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-900/70 transition-colors hover:border-maroon-400 hover:text-maroon-600 dark:border-white/15 dark:text-white/70"
      >
        Sign out
      </button>
    </div>
  );
}