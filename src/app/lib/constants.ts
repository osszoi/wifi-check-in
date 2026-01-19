export const COLORS = [
  { bg: 'bg-blue-700', hex: '#1d4ed8' },
  { bg: 'bg-emerald-700', hex: '#047857' },
  { bg: 'bg-violet-700', hex: '#6d28d9' },
  { bg: 'bg-amber-700', hex: '#b45309' },
  { bg: 'bg-rose-700', hex: '#be123c' },
  { bg: 'bg-cyan-700', hex: '#0e7490' },
  { bg: 'bg-fuchsia-700', hex: '#a21caf' },
  { bg: 'bg-lime-700', hex: '#4d7c0f' },
];

export const getPersonColor = (person: string, allPeople: string[]) => {
  const index = allPeople.indexOf(person);
  return COLORS[index % COLORS.length];
};

export const getMonths = (t: (key: string) => string): string[] => [
  t('months.january'),
  t('months.february'),
  t('months.march'),
  t('months.april'),
  t('months.may'),
  t('months.june'),
  t('months.july'),
  t('months.august'),
  t('months.september'),
  t('months.october'),
  t('months.november'),
  t('months.december'),
];

export const getWeekdays = (t: (key: string) => string): string[] => [
  t('weekdays.sun'),
  t('weekdays.mon'),
  t('weekdays.tue'),
  t('weekdays.wed'),
  t('weekdays.thu'),
  t('weekdays.fri'),
  t('weekdays.sat'),
];
