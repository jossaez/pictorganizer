import { CheckCircle2, Clock, Forward, Smile, XCircle, type LucideIcon } from 'lucide-react';
import type { ComputedActivityState } from '@/domain/services/activity-state.service';

export interface ActivityStatusPresentation {
  label: string;
  description: string;
  colorClass: string;
  badgeClass: string;
  ringClass: string;
  pictogramClass: string;
  icon: LucideIcon;
}

export const ACTIVITY_STATUS_PRESENTATION: Record<
  ComputedActivityState,
  ActivityStatusPresentation
> = {
  pending: {
    label: 'Pendiente',
    description: 'Actividad programada',
    colorClass: 'text-slate-700',
    badgeClass: 'a11y-status-badge bg-slate-100 text-slate-700',
    ringClass: 'ring-slate-100',
    pictogramClass: 'bg-slate-100',
    icon: Clock,
  },
  in_progress: {
    label: 'En curso',
    description: 'Es el momento de hacerla',
    colorClass: 'text-blue-800',
    badgeClass: 'a11y-status-badge bg-blue-100 text-blue-800',
    ringClass: 'ring-2 ring-[var(--color-primary)] shadow-md',
    pictogramClass: 'bg-blue-100',
    icon: Clock,
  },
  completed: {
    label: 'Hecho',
    description: 'Actividad completada',
    colorClass: 'text-emerald-800',
    badgeClass: 'a11y-status-badge bg-emerald-100 text-emerald-800',
    ringClass: 'ring-emerald-100',
    pictogramClass: 'bg-emerald-50',
    icon: CheckCircle2,
  },
  skipped: {
    label: 'Saltada',
    description: 'Actividad saltada',
    colorClass: 'text-amber-800',
    badgeClass: 'a11y-status-badge bg-amber-100 text-amber-800',
    ringClass: 'ring-amber-100',
    pictogramClass: 'bg-amber-50',
    icon: Forward,
  },
  missed: {
    label: 'No realizada',
    description: 'Actividad pendiente pasada',
    colorClass: 'text-red-700',
    badgeClass: 'a11y-status-badge bg-red-50 text-red-700',
    ringClass: 'ring-red-100',
    pictogramClass: 'bg-red-50',
    icon: XCircle,
  },
};

export function getStatusPresentation(state: ComputedActivityState): ActivityStatusPresentation {
  return ACTIVITY_STATUS_PRESENTATION[state];
}

export function getStatusLabel(state: ComputedActivityState): string {
  return ACTIVITY_STATUS_PRESENTATION[state].label;
}

/** Large emoji for completed state in child-facing UI */
export function getCompletedEmoji(): string {
  return '😊';
}
