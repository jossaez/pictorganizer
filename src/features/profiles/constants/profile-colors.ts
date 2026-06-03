export const PROFILE_COLOR_OPTIONS = [
  { id: 'blue', value: '#5b8def', label: 'Azul' },
  { id: 'green', value: '#34d399', label: 'Verde' },
  { id: 'orange', value: '#fb923c', label: 'Naranja' },
  { id: 'purple', value: '#a78bfa', label: 'Morado' },
  { id: 'pink', value: '#f472b6', label: 'Rosa' },
  { id: 'turquoise', value: '#2dd4bf', label: 'Turquesa' },
] as const;

export const DEFAULT_PROFILE_COLOR = PROFILE_COLOR_OPTIONS[0].value;
