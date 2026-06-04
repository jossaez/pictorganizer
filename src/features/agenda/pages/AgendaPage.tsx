import { LayoutList, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { DayTimeline } from '@/features/agenda/components/DayTimeline';
import { NowNextLater } from '@/features/agenda/components/NowNextLater';
import { WeekNavigator } from '@/features/agenda/components/WeekNavigator';
import { DailyProgressCard } from '@/features/progress/components/DailyProgressCard';
import { useDayAgenda } from '@/features/agenda/hooks/useDayAgenda';
import { Button } from '@/components/ui/Button';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useAvatars } from '@/features/profiles/hooks/useAvatars';
import { profileTimerVariant } from '@/features/timer/components/VisualTimer';
import { useAppStore } from '@/store/app.store';
import { useDevice } from '@/hooks/useDevice';
import { formatDisplayDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

export function AgendaPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const userMode = useAppStore((s) => s.userMode);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const { isEffectiveTablet } = useDevice();
  const { activeProfile } = useProfiles();
  const { avatars } = useAvatars();

  const {
    date,
    todayDate,
    currentTimeMinutes,
    activities,
    enrichedActivities,
    progress,
    profileSettings,
    isLoading,
    error,
    isActing,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    completeActivity,
    skipActivity,
    undoActivity,
  } = useDayAgenda(activeProfileId);

  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const isAdultMode = userMode === 'adult';
  const isChildMode = userMode === 'child';

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setFlashMessage(state.message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleComplete = (id: string) => void completeActivity(id);
  const handleEdit = isAdultMode ? (id: string) => navigate(`/activities/${id}/edit`) : undefined;
  const handleSkip = isAdultMode ? (id: string) => void skipActivity(id) : undefined;
  const handleUndo = isAdultMode ? (id: string) => void undoActivity(id) : undefined;

  if (!activeProfileId) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-slate-600">{t('agenda.noProfile')}</p>
        <Button onClick={() => navigate('/profiles')}>{t('agenda.goProfiles')}</Button>
      </div>
    );
  }

  const hasActivities = !isLoading && activities.length > 0;
  const showTimer = profileSettings?.showTimer ?? true;
  const timerVariant = isChildMode
    ? 'blocks'
    : profileTimerVariant(profileSettings?.timerStyle);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {activeProfile && (
              <ProfileAvatar profile={activeProfile} size="md" avatars={avatars} />
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                {t('agenda.agendaOf')}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {activeProfile?.name ?? t('settings.activeProfile')}
              </h2>
              <p className="mt-1 capitalize text-slate-600">{formatDisplayDate(date)}</p>
            </div>
          </div>
          {isAdultMode && (
            <Button className="gap-2" onClick={() => navigate('/activities/new')}>
              <Plus className="h-5 w-5" aria-hidden />
              {t('activity.add')}
            </Button>
          )}
        </div>

        <WeekNavigator
          profileId={activeProfileId}
          selectedDate={date}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
        />
      </header>

      {flashMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {flashMessage}
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-slate-500">{t('agenda.loading')}</p>
      ) : !hasActivities ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          {isAdultMode ? (
            <>
              <p className="text-lg text-slate-600">{t('agenda.emptyDay')}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button className="gap-2" onClick={() => navigate('/activities/new')}>
                  <Plus className="h-5 w-5" aria-hidden />
                  {t('activity.add')}
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => navigate('/routines')}
                >
                  <LayoutList className="h-5 w-5" aria-hidden />
                  {t('routines.add')}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-lg text-slate-600">{t('agenda.emptyToday')}</p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'gap-6 md:gap-8',
            isEffectiveTablet && !isChildMode
              ? 'grid grid-cols-2 items-start'
              : 'space-y-8',
          )}
        >
          <div className={cn('space-y-6 md:space-y-8', isEffectiveTablet && !isChildMode && 'min-w-0')}>
            <section aria-label={t('agenda.sectionNowNextLater')}>
              <NowNextLater
                activities={activities}
                currentTimeMinutes={currentTimeMinutes}
                date={date}
                todayDate={todayDate}
                profileSettings={profileSettings}
                userMode={userMode}
                onComplete={handleComplete}
                onEdit={handleEdit}
                onSkip={handleSkip}
                onUndo={handleUndo}
                disabled={isActing}
                reduceMotion={reduceMotion}
              />
            </section>

            <section aria-label={t('agenda.sectionDayProgress')}>
              <DailyProgressCard
                progress={progress}
                userMode={userMode}
                isLoading={isLoading}
              />
            </section>
          </div>

          {!isChildMode && (
            <section aria-label={t('agenda.sectionDayTimeline')} className="min-w-0">
              <DayTimeline
                activities={enrichedActivities}
                onComplete={handleComplete}
                onEdit={handleEdit}
                onSkip={handleSkip}
                onUndo={handleUndo}
                disabled={isActing}
                currentTimeMinutes={currentTimeMinutes}
                showTimer={showTimer}
                timerVariant={timerVariant}
                reduceMotion={reduceMotion}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
