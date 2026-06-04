import {
  CelebrationStyle,
  ChildModeDetailLevel,
  DeviceLayout,
  TimerStyle,
} from '@/domain/enums';

export const CELEBRATION_STYLE_LABEL_KEYS: Record<CelebrationStyle, string> = {
  [CelebrationStyle.None]: 'labels.celebrationNone',
  [CelebrationStyle.Smile]: 'labels.celebrationSmile',
  [CelebrationStyle.Star]: 'labels.celebrationStar',
  [CelebrationStyle.ConfettiSoft]: 'labels.celebrationConfetti',
};

export const TIMER_STYLE_LABEL_KEYS: Record<TimerStyle, string> = {
  [TimerStyle.Bar]: 'labels.timerBar',
  [TimerStyle.Clock]: 'labels.timerClock',
};

export const CHILD_DETAIL_LEVEL_LABEL_KEYS: Record<ChildModeDetailLevel, string> = {
  [ChildModeDetailLevel.Minimal]: 'detailLevel.minimalDesc',
  [ChildModeDetailLevel.Standard]: 'detailLevel.standardDesc',
  [ChildModeDetailLevel.Detailed]: 'detailLevel.detailedDesc',
};

export const DEVICE_LAYOUT_LABEL_KEYS: Record<DeviceLayout, string> = {
  [DeviceLayout.Phone]: 'settings.phone',
  [DeviceLayout.Tablet]: 'settings.tablet',
  [DeviceLayout.Auto]: 'device.auto',
};

export const NOTIFICATION_TIMING_LABEL_KEYS = [
  { value: 0, labelKey: 'notifications.timingAtActivity' },
  { value: 5, labelKey: 'notifications.timing5' },
  { value: 10, labelKey: 'notifications.timing10' },
  { value: 15, labelKey: 'notifications.timing15' },
] as const;
