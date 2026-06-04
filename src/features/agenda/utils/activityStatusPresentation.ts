import { CheckCircle2, Clock, Forward, XCircle, type LucideIcon } from 'lucide-react';
import type { ComputedActivityState } from '@/domain/services/activity-state.service';
import { i18n } from '@/i18n';

export interface ActivityStatusPresentation {
  label: string;
  description: string;
  colorClass: string;
  badgeClass: string;
  ringClass: string;
  pictogramClass: string;
  icon: LucideIcon;
}

const STATUS_STYLE: Record<
  ComputedActivityState,
  Omit<ActivityStatusPresentation, 'label' | 'description'>
> = {
  pending: {
    colorClass: 'text-slate-700',
    badgeClass: 'a11y-status-badge bg-slate-100 text-slate-700',
    ringClass: 'ring-slate-100',
    pictogramClass: 'bg-slate-100',
    icon: Clock,
  },
  in_progress: {
    colorClass: 'text-blue-800',
    badgeClass: 'a11y-status-badge bg-blue-100 text-blue-800',
    ringClass: 'ring-2 ring-[var(--color-primary)] shadow-md',
    pictogramClass: 'bg-blue-100',
    icon: Clock,
  },
  completed: {
    colorClass: 'text-emerald-800',
    badgeClass: 'a11y-status-badge bg-emerald-100 text-emerald-800',
    ringClass: 'ring-emerald-100',
    pictogramClass: 'bg-emerald-50',
    icon: CheckCircle2,
  },
  skipped: {
    colorClass: 'text-amber-800',
    badgeClass: 'a11y-status-badge bg-amber-100 text-amber-800',
    ringClass: 'ring-amber-100',
    pictogramClass: 'bg-amber-50',
    icon: Forward,
  },
  missed: {
    colorClass: 'text-red-700',
    badgeClass: 'a11y-status-badge bg-red-50 text-red-700',
    ringClass: 'ring-red-100',
    pictogramClass: 'bg-red-50',
    icon: XCircle,
  },
};

const STATUS_I18N_KEY: Record<ComputedActivityState, 'pending' | 'inProgress' | 'completed' | 'skipped' | 'missed'> = {
  pending: 'pending',
  in_progress: 'inProgress',
  completed: 'completed',
  skipped: 'skipped',
  missed: 'missed',
};

export function getStatusPresentation(state: ComputedActivityState): ActivityStatusPresentation {
  const key = STATUS_I18N_KEY[state];
  const style = STATUS_STYLE[state];
  return {
    ...style,
    label: i18n.t(`activity.status.${key}`),
    description: i18n.t(`activity.statusDesc.${key}`),
  };
}

export function getStatusLabel(state: ComputedActivityState): string {
  return getStatusPresentation(state).label;
}

/** Large emoji for completed state in child-facing UI */
export function getCompletedEmoji(): string {
  return '😊';
}
