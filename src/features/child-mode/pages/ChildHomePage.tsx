import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DailyProgressCard } from '@/features/progress/components/DailyProgressCard';
import { NowNextLater } from '@/features/agenda/components/NowNextLater';
import { useDayAgenda } from '@/features/agenda/hooks/useDayAgenda';
import { useDevice } from '@/hooks/useDevice';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

export function ChildHomePage() {
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const { isEffectiveTablet } = useDevice();

  const {
    date,
    todayDate,
    currentTimeMinutes,
    activities,
    progress,
    profileSettings,
    isLoading,
    error,
    isActing,
    completeActivity,
  } = useDayAgenda(activeProfileId);

  const handleComplete = (id: string) => void completeActivity(id);

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando…</p>;
  }

  const dayLink = (
    <Link to="/child/day">
      <Button fullWidth variant="secondary" className="min-h-16 text-lg md:min-h-14">
        Ver mi día
      </Button>
    </Link>
  );

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-red-700" role="alert">
          {error}
        </p>
      )}

      {activities.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100 md:p-12">
          <p className="text-xl font-semibold text-slate-700 md:text-2xl">Hoy no hay actividades</p>
        </div>
      ) : isEffectiveTablet ? (
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start gap-6 md:gap-8">
          <section aria-label="Qué toca ahora">
            <NowNextLater
              activities={activities}
              currentTimeMinutes={currentTimeMinutes}
              date={date}
              todayDate={todayDate}
              profileSettings={profileSettings}
              userMode="child"
              onComplete={handleComplete}
              disabled={isActing}
              reduceMotion={reduceMotion}
            />
          </section>

          <div className="space-y-6">
            <section aria-label="Progreso del día">
              <DailyProgressCard progress={progress} userMode="child" />
            </section>
            {dayLink}
          </div>
        </div>
      ) : (
        <>
          <section aria-label="Qué toca ahora">
            <NowNextLater
              activities={activities}
              currentTimeMinutes={currentTimeMinutes}
              date={date}
              todayDate={todayDate}
              profileSettings={profileSettings}
              userMode="child"
              onComplete={handleComplete}
              disabled={isActing}
              reduceMotion={reduceMotion}
            />
          </section>

          <section aria-label="Progreso del día">
            <DailyProgressCard progress={progress} userMode="child" />
          </section>

          <div className="pt-2">{dayLink}</div>
        </>
      )}
    </div>
  );
}
