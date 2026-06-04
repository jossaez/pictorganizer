import {
  Baby,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  LayoutList,
  Settings,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { Card } from '@/components/ui/Card';
import { useAvatars } from '@/features/profiles/hooks/useAvatars';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useDevice } from '@/hooks/useDevice';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

interface DashboardCard {
  to?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  onClick?: () => void;
}

function DashboardCardLink({
  to,
  label,
  description,
  icon: Icon,
  iconClass,
  onClick,
}: DashboardCard) {
  const content = (
    <Card
      className={cn(
        'flex h-full items-start gap-4 transition-shadow hover:shadow-md',
        (to || onClick) && 'cursor-pointer',
      )}
      padding="lg"
    >
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
          iconClass,
        )}
      >
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">{label}</h3>
          <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
        </div>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <button type="button" className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

export function AdultDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUserMode = useAppStore((s) => s.setUserMode);
  const { activeProfile } = useProfiles();
  const { avatars } = useAvatars();
  const { isEffectiveTablet } = useDevice();

  const cards: DashboardCard[] = [
    {
      to: '/profiles',
      label: t('adultMode.dashboard.profiles'),
      description: t('adultMode.dashboard.profilesDesc'),
      icon: Users,
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      to: '/agenda',
      label: t('nav.agenda'),
      description: t('adultMode.dashboard.agendaDesc'),
      icon: CalendarDays,
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      to: '/routines',
      label: t('nav.routines'),
      description: t('adultMode.dashboard.routinesDesc'),
      icon: LayoutList,
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      to: '/activities/new',
      label: t('adultMode.dashboard.createActivity'),
      description: t('adultMode.dashboard.createActivityDesc'),
      icon: CalendarPlus,
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      to: '/progress',
      label: t('nav.progress'),
      description: t('adultMode.dashboard.progressDesc'),
      icon: TrendingUp,
      iconClass: 'bg-rose-100 text-rose-700',
    },
    {
      to: '/settings',
      label: t('nav.settings'),
      description: t('adultMode.dashboard.settingsDesc'),
      icon: Settings,
      iconClass: 'bg-slate-100 text-slate-700',
    },
    {
      label: t('adultMode.dashboard.enterChild'),
      description: t('adultMode.dashboard.enterChildDesc'),
      icon: Baby,
      iconClass: 'bg-sky-100 text-sky-700',
      onClick: () => {
        setUserMode('child');
        navigate('/child');
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-violet-700">{t('adultMode.familyPanel')}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{t('adultMode.title')}</h1>
        <p className="mt-2 text-slate-600">{t('adultMode.subtitle')}</p>
      </div>

      {activeProfile && (
        <Card padding="lg" className="flex items-center gap-4">
          <ProfileAvatar profile={activeProfile} size="md" avatars={avatars} />
          <div>
            <p className="text-sm text-slate-500">{t('adultMode.activeProfile')}</p>
            <p className="text-xl font-bold text-slate-900">{activeProfile.name}</p>
          </div>
        </Card>
      )}

      <ul
        className={cn(
          'grid gap-4',
          isEffectiveTablet ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
        )}
      >
        {cards.map((card) => (
          <li key={card.label} className="h-full">
            <DashboardCardLink {...card} />
          </li>
        ))}
      </ul>
    </div>
  );
}
