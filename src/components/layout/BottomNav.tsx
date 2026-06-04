import { CalendarDays, LayoutList, Settings, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/routines', label: 'Rutinas', icon: LayoutList },
  { to: '/progress', label: 'Progreso', icon: TrendingUp },
  { to: '/settings', label: 'Ajustes', icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-2 backdrop-blur-md"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 pt-2 md:max-w-5xl">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-[var(--color-primary)]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              )
            }
          >
            <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
