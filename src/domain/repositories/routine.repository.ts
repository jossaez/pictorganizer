import type { Routine, RoutineTemplate } from '../types';

export interface ApplyRoutineTemplateInput {
  profileId: string;
  templateId: string;
  /** Anchor time in minutes from midnight for step offsets */
  anchorTimeMinutes: number;
  /** Optional custom name; defaults to template name */
  name?: string;
  /** First date to generate instances from */
  startDate: string;
}

export interface ApplyRoutineTemplateResult {
  routine: Routine;
  /** IDs of created ActivityTemplates — instances generated separately */
  templateIds: string[];
}

export interface IRoutineRepository {
  createRoutine(
    input: Pick<Routine, 'profileId' | 'name'> &
      Partial<Pick<Routine, 'description' | 'sourceTemplateId' | 'sortOrder'>>,
  ): Promise<Routine>;

  updateRoutine(
    id: string,
    input: Partial<Pick<Routine, 'name' | 'description' | 'sortOrder' | 'isActive'>>,
  ): Promise<Routine>;

  getRoutineById(id: string): Promise<Routine | undefined>;

  getActiveRoutinesByProfile(profileId: string): Promise<Routine[]>;

  softDeleteRoutine(id: string): Promise<void>;

  /** Active routine for profile created from a global template */
  findActiveRoutineBySourceTemplate(
    profileId: string,
    sourceTemplateId: string,
  ): Promise<Routine | undefined>;

  /** Read-only catalog access */
  getRoutineTemplateById(id: string): Promise<RoutineTemplate | undefined>;

  getAllRoutineTemplates(): Promise<RoutineTemplate[]>;

  /**
   * Transaction: Routine + ActivityTemplates (+ optional instance generation
   * delegated to IActivityRepository in application layer).
   */
  applyRoutineTemplate(input: ApplyRoutineTemplateInput): Promise<ApplyRoutineTemplateResult>;
}
