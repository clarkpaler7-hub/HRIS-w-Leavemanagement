import type { ReactNode } from 'react';
import { Sunrise, Sun, Moon } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', Icon: Sunrise };
  if (hour < 18) return { text: 'Good afternoon', Icon: Sun };
  return { text: 'Good evening', Icon: Moon };
}

export function GreetingBanner({
  name,
  subtitle = "Here's your overview for today",
  stats = [],
}: {
  name?: string;
  subtitle?: string;
  stats?: { label: string; value: ReactNode }[];
}) {
  const { text, Icon } = getGreeting();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-700 via-maroon-600 to-maroon-500 p-6 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Icon className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              {text}
              {name ? `, ${name}` : ''}
            </h1>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[84px] rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur"
              >
                <p className="text-xs text-white/70">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}