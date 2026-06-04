import {
  CalendarDays,
  LayoutDashboard,
  LayoutList,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface AdultNavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const ADULT_NAV_ITEMS: AdultNavItem[] = [
  { to: '/adult', labelKey: 'nav.home', icon: LayoutDashboard, end: true },
  { to: '/agenda', labelKey: 'nav.agenda', icon: CalendarDays },
  { to: '/routines', labelKey: 'nav.routines', icon: LayoutList },
  { to: '/progress', labelKey: 'nav.progress', icon: TrendingUp },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];
