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
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const ADULT_NAV_ITEMS: AdultNavItem[] = [
  { to: '/adult', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/routines', label: 'Rutinas', icon: LayoutList },
  { to: '/progress', label: 'Progreso', icon: TrendingUp },
  { to: '/settings', label: 'Ajustes', icon: Settings },
];
