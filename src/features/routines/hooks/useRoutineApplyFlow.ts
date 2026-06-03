import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplyRoutineTemplate } from '@/features/routines/hooks/useRoutineTemplates';

interface SuccessState {
  profileName: string;
  routineName: string;
  instancesCreated: number;
}

interface DuplicateState {
  templateId: string;
  templateName: string;
}

export function useRoutineApplyFlow() {
  const navigate = useNavigate();
  const {
    activeProfileId,
    applyRoutineTemplateToActiveProfile,
    isApplying,
    error,
    setError,
  } = useApplyRoutineTemplate();

  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateState | null>(null);

  const applyTemplate = useCallback(
    async (templateId: string, asCopy = false): Promise<void> => {
      setError(null);
      const response = await applyRoutineTemplateToActiveProfile(templateId, asCopy);

      if (response.success) {
        setDuplicate(null);
        setSuccess({
          profileName: response.profileName,
          routineName: response.result.routineName,
          instancesCreated: response.result.instancesCreated,
        });
        return;
      }

      if (response.duplicate) {
        setDuplicate({ templateId, templateName: response.templateName });
      }
    },
    [applyRoutineTemplateToActiveProfile, setError],
  );

  const handleApplyCopy = useCallback(async (): Promise<void> => {
    if (!duplicate) return;
    await applyTemplate(duplicate.templateId, true);
    setDuplicate(null);
  }, [applyTemplate, duplicate]);

  const dialogProps = {
    duplicateTemplateName: duplicate?.templateName ?? null,
    isApplying,
    success,
    onApplyCopy: () => void handleApplyCopy(),
    onCancelDuplicate: () => setDuplicate(null),
    onViewAgenda: () => {
      setSuccess(null);
      navigate('/agenda');
    },
    onCloseSuccess: () => setSuccess(null),
  };

  return {
    activeProfileId,
    isApplying,
    error,
    applyTemplate,
    dialogProps,
  };
}
