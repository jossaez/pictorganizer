import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { DayTimeline } from '@/features/agenda/components/DayTimeline';
import { useDayAgenda } from '@/features/agenda/hooks/useDayAgenda';
import { useAppStore } from '@/store/app.store';
import { formatDisplayDate } from '@/utils/formatDate';

export function ChildDayPage() {
  const { t } = useTranslation();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const reduceMotion = useAppStore((s) => s.reduceMotion);

  const {
    date,
    enrichedActivities,
    profileSettings,
    currentTimeMinutes,
    isLoading,
    error,
    isActing,
    completeActivity,
  } = useDayAgenda(activeProfileId);

  const showTimer = profileSettings?.showTimer ?? true;

  if (isLoading) {
    return <p className="text-center text-slate-500">{t('common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold capitalize text-slate-900 md:text-2xl">
          {formatDisplayDate(date)}
        </h2>
        <Link to="/child">
          <Button variant="ghost" className="text-[var(--color-primary)]">
            {t('childMode.back')}
          </Button>
        </Link>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-red-700" role="alert">
          {error}
        </p>
      )}

      {enrichedActivities.length === 0 ? (
        <p className="rounded-3xl bg-white p-8 text-center text-lg text-slate-600 shadow-sm">
          {t('childMode.noActivitiesToday')}
        </p>
      ) : (
        <DayTimeline
          activities={enrichedActivities}
          onComplete={(id) => void completeActivity(id)}
          disabled={isActing}
          currentTimeMinutes={currentTimeMinutes}
          showTimer={showTimer}
          timerVariant="blocks"
          reduceMotion={reduceMotion}
          childMode={true}
          profileSettings={profileSettings}
        />
      )}
    </div>
  );
}
