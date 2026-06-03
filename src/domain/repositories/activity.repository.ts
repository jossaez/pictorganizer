import type { SkippedBy } from '../enums';
import type {
  ActivityInstance,
  ActivityTemplate,
  CreateActivityTemplateInput,
  EditScope,
  UpdateActivityTemplateInput,
  UpdateSingleInstanceInput,
} from '../types';

export interface GenerateInstancesOptions {
  /** Inclusive ISO date YYYY-MM-DD */
  fromDate: string;
  /** Inclusive ISO date YYYY-MM-DD */
  toDate: string;
  /** Skip instances that already exist for (templateId, date) */
  skipExisting?: boolean;
}

export interface GenerateInstancesResult {
  created: ActivityInstance[];
  skipped: number;
}

export interface IActivityRepository {
  // ── Templates ──────────────────────────────────────────────

  createTemplate(input: CreateActivityTemplateInput): Promise<ActivityTemplate>;

  getTemplateById(id: string): Promise<ActivityTemplate | undefined>;

  getActiveTemplatesByProfile(profileId: string): Promise<ActivityTemplate[]>;

  getTemplatesByRoutine(routineId: string): Promise<ActivityTemplate[]>;

  updateTemplate(id: string, input: UpdateActivityTemplateInput): Promise<ActivityTemplate>;

  softDeleteTemplate(id: string): Promise<void>;

  // ── Instances ──────────────────────────────────────────────

  /**
   * Generates ActivityInstance rows from a template using RecurrenceService.
   * Respects isException instances — does not overwrite them.
   */
  generateInstances(
    templateId: string,
    options: GenerateInstancesOptions,
  ): Promise<GenerateInstancesResult>;

  /**
   * Transaction: createTemplate + generateInstances for rolling window.
   */
  createTemplateWithInstances(
    input: CreateActivityTemplateInput,
    windowDays?: number,
  ): Promise<{ template: ActivityTemplate; instances: ActivityInstance[] }>;

  getInstanceById(id: string): Promise<ActivityInstance | undefined>;

  /** Primary agenda query — ordered by startTimeMinutes */
  getInstancesByDate(profileId: string, date: string): Promise<ActivityInstance[]>;

  getInstancesByDateRange(
    profileId: string,
    fromDate: string,
    toDate: string,
  ): Promise<ActivityInstance[]>;

  /** Edit single day — sets isException=true */
  updateSingleInstance(id: string, input: UpdateSingleInstanceInput): Promise<ActivityInstance>;

  /**
   * Transaction: update template + delete/regenerate future non-exception instances.
   */
  updateTemplateAndFutureInstances(
    templateId: string,
    input: UpdateActivityTemplateInput,
    effectiveFromDate: string,
    scope: EditScope,
  ): Promise<{ template: ActivityTemplate; instances: ActivityInstance[] }>;

  completeInstance(id: string, completedAt?: string): Promise<ActivityInstance>;

  skipInstance(id: string, skippedBy: SkippedBy, skippedAt?: string): Promise<ActivityInstance>;

  undoInstanceStatus(id: string): Promise<ActivityInstance>;

  /** @deprecated Use undoInstanceStatus */
  undoCompleteOrSkip(id: string): Promise<ActivityInstance>;

  softDeleteInstance(id: string): Promise<void>;

  /**
   * Extends rolling window if future instances < thresholdDays.
   * Called on app boot / day change.
   */
  extendRollingWindowForProfile(profileId: string, thresholdDays?: number): Promise<void>;

  /** Delete future regenerable instances for template from date onward */
  deleteFutureInstances(
    templateId: string,
    fromDate: string,
    preserveExceptions?: boolean,
  ): Promise<number>;

  /** Regenerate non-exception instances from date within rolling window */
  regenerateFutureInstances(
    templateId: string,
    fromDate: string,
    windowDays?: number,
  ): Promise<ActivityInstance[]>;
}
