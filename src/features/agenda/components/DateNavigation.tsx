import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { formatDisplayDate } from '@/utils/formatDate';
import { todayISODate } from '@/utils/today';
import { cn } from '@/utils/cn';

interface DateNavigationProps {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DateNavigation({ date, onPrevious, onNext, onToday }: DateNavigationProps) {
  const { t } = useTranslation();
  const isToday = date === todayISODate();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="capitalize text-base font-medium text-slate-700 sm:text-lg">
        {formatDisplayDate(date)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="min-h-11 px-3"
          onClick={onPrevious}
          aria-label={t('agenda.prevDay')}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Button>
        <Button
          variant={isToday ? 'secondary' : 'primary'}
          className={cn('min-h-11 gap-2', isToday && 'opacity-60')}
          onClick={onToday}
          disabled={isToday}
          aria-label={t('agenda.backToToday')}
        >
          <CalendarDays className="h-4 w-4" aria-hidden />
          {t('agenda.today')}
        </Button>
        <Button
          variant="secondary"
          className="min-h-11 px-3"
          onClick={onNext}
          aria-label={t('agenda.nextDay')}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
