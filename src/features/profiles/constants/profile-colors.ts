export const PROFILE_COLOR_OPTIONS = [
  { id: 'blue', value: '#5b8def', labelKey: 'profiles.colors.blue' },
  { id: 'pink', value: '#f472b6', labelKey: 'profiles.colors.pink' },
  { id: 'green', value: '#34d399', labelKey: 'profiles.colors.green' },
  { id: 'amber', value: '#fbbf24', labelKey: 'profiles.colors.amber' },
  { id: 'violet', value: '#a78bfa', labelKey: 'profiles.colors.violet' },
  { id: 'turquoise', value: '#2dd4bf', labelKey: 'profiles.colors.turquoise' },
] as const;

export const DEFAULT_PROFILE_COLOR = PROFILE_COLOR_OPTIONS[0].value;
