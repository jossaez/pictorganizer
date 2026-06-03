/** Recurrence pattern discriminator for ActivityTemplate.recurrence */
export enum RecurrenceType {
  Once = 'once',
  Daily = 'daily',
  Weekdays = 'weekdays',
  Weekly = 'weekly',
  Custom = 'custom',
}

/** Persisted / materialized status of an ActivityInstance */
export enum ActivityStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Skipped = 'skipped',
  Missed = 'missed',
}

/** Cloud sync readiness (v1: always Local) */
export enum SyncStatus {
  Local = 'local',
  Pending = 'pending',
  Synced = 'synced',
  Conflict = 'conflict',
}

export enum DeviceLayout {
  Phone = 'phone',
  Tablet = 'tablet',
  Auto = 'auto',
}

/** Visual feedback when an activity is completed */
export enum CelebrationStyle {
  None = 'none',
  Smile = 'smile',
  Star = 'star',
  ConfettiSoft = 'confetti_soft',
}

export enum TimerStyle {
  Bar = 'bar',
  Clock = 'clock',
}

/** How much detail the child-mode agenda shows */
export enum ChildModeDetailLevel {
  Minimal = 'minimal',
  Standard = 'standard',
  Detailed = 'detailed',
}

export enum ActivityVisibility {
  Visible = 'visible',
  AdultOnly = 'adult_only',
  Hidden = 'hidden',
}

export enum SkippedBy {
  Child = 'child',
  Adult = 'adult',
}

/** Singleton row identifier for appSettings table */
export const APP_SETTINGS_ID = 'app' as const;
