export const COLORS = [
  { bg: 'bg-blue-500', hex: '#3b82f6' },
  { bg: 'bg-emerald-500', hex: '#10b981' },
  { bg: 'bg-violet-500', hex: '#8b5cf6' },
  { bg: 'bg-amber-500', hex: '#f59e0b' },
  { bg: 'bg-rose-500', hex: '#f43f5e' },
  { bg: 'bg-cyan-500', hex: '#06b6d4' },
  { bg: 'bg-fuchsia-500', hex: '#d946ef' },
  { bg: 'bg-lime-500', hex: '#84cc16' },
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getPersonColor = (person: string, allPeople: string[]) => {
  const index = allPeople.indexOf(person);
  return COLORS[index % COLORS.length];
};
