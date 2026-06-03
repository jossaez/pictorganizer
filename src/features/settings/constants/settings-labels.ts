import {
  CelebrationStyle,
  ChildModeDetailLevel,
  DeviceLayout,
  TimerStyle,
} from '@/domain/enums';

export const CELEBRATION_STYLE_LABELS: Record<CelebrationStyle, string> = {
  [CelebrationStyle.None]: 'Sin celebración',
  [CelebrationStyle.Smile]: 'Carita feliz',
  [CelebrationStyle.Star]: 'Estrella',
  [CelebrationStyle.ConfettiSoft]: 'Confeti suave',
};

export const TIMER_STYLE_LABELS: Record<TimerStyle, string> = {
  [TimerStyle.Bar]: 'Barra',
  [TimerStyle.Clock]: 'Reloj',
};

export const CHILD_DETAIL_LEVEL_LABELS: Record<ChildModeDetailLevel, string> = {
  [ChildModeDetailLevel.Minimal]: 'Simple — pictograma y título',
  [ChildModeDetailLevel.Standard]: 'Normal — con hora',
  [ChildModeDetailLevel.Detailed]: 'Completo — con ver detalle',
};

export const DEVICE_LAYOUT_LABELS: Record<DeviceLayout, string> = {
  [DeviceLayout.Phone]: 'Teléfono',
  [DeviceLayout.Tablet]: 'Tablet',
  [DeviceLayout.Auto]: 'Automático',
};

export const NOTIFICATION_TIMING_OPTIONS = [
  { value: 0, label: 'A la hora de la actividad' },
  { value: 5, label: '5 minutos antes' },
  { value: 10, label: '10 minutos antes' },
  { value: 15, label: '15 minutos antes' },
] as const;
