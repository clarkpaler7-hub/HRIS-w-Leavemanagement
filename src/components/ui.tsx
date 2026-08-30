import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white bg-gradient-to-b from-white to-[#f6f1e8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(128,0,32,0.06),0_10px_24px_-8px_rgba(128,0,32,0.2)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="relative overflow-hidden border-t-2 border-t-gold-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-maroon-500">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-900/50">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-50 text-maroon-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(128,0,32,0.15)]">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
        )}
      </div>
    </Card>
  );
}

const statusStyles: Record<string, string> = {
  active: 'bg-maroon-50 text-maroon-600 ring-1 ring-inset ring-maroon-200',
  present: 'bg-maroon-50 text-maroon-600 ring-1 ring-inset ring-maroon-200',
  approved: 'bg-maroon-50 text-maroon-600 ring-1 ring-inset ring-maroon-200',
  paid: 'bg-maroon-50 text-maroon-600 ring-1 ring-inset ring-maroon-200',
  pending: 'bg-gold-100 text-gold-700 ring-1 ring-inset ring-gold-300',
  endorsed: 'bg-gold-100 text-gold-700 ring-1 ring-inset ring-gold-300',
  for_review: 'bg-gold-100 text-gold-700 ring-1 ring-inset ring-gold-300',
  on_leave: 'bg-gold-100 text-gold-700 ring-1 ring-inset ring-gold-300',
  half_day: 'bg-gold-100 text-gold-700 ring-1 ring-inset ring-gold-300',
  late: 'bg-gold-100 text-gold-700 ring-1 ring-inset ring-gold-300',
  suspended: 'bg-ink-900/5 text-ink-900 ring-1 ring-inset ring-ink-900/15',
  rejected: 'bg-ink-900 text-white',
  terminated: 'bg-ink-900 text-white',
  absent: 'bg-ink-900 text-white',
  cancelled: 'bg-ink-900/5 text-ink-900/60 ring-1 ring-inset ring-ink-900/10',
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? 'bg-ink-900/5 text-ink-900/70';
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const variants: Record<string, string> = {
    primary: 'bg-maroon-500 text-white hover:bg-maroon-600',
    secondary: 'bg-white text-ink-900 border border-ink-900/15 hover:border-maroon-400 hover:text-maroon-600',
    danger: 'bg-ink-900 text-white hover:bg-black',
  };
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white border-t-4 border-t-gold-400 bg-gradient-to-b from-white to-[#f6f1e8] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_40px_-10px_rgba(128,0,32,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-900/40 hover:text-maroon-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function RejectionReasonModal({
  open,
  onClose,
  reason,
}: {
  open: boolean;
  onClose: () => void;
  reason: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white border-t-4 border-t-gold-400 bg-gradient-to-b from-white to-[#f6f1e8] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_40px_-10px_rgba(128,0,32,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink-900">
          <AlertCircle className="h-6 w-6 text-ink-900" strokeWidth={2} />
        </div>
        <h2 className="mb-2 font-display text-xl font-bold text-ink-900">Rejection Reason</h2>
        <p className="mb-5 whitespace-pre-wrap text-sm text-ink-900/70">{reason}</p>
        <Button type="button" variant="secondary" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}