import { NavLink } from 'react-router-dom';
import { ADULT_NAV_ITEMS } from '@/features/adult-mode/constants/adult-nav';
import { cn } from '@/utils/cn';

interface AdultNavLinksProps {
  layout: 'sidebar' | 'bottom';
}

export function AdultNavLinks({ layout }: AdultNavLinksProps) {
  const isSidebar = layout === 'sidebar';

  return (
    <>
      {ADULT_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              isSidebar
                ? 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors'
                : 'flex min-h-14 min-w-[4rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-violet-50 text-violet-800'
                : isSidebar
                  ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
            )
          }
        >
          <Icon className={cn(isSidebar ? 'h-5 w-5' : 'h-6 w-6')} strokeWidth={2} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
}
