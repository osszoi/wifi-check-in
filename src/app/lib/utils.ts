// time in UTC (HH:MM or HH:MM:SS), date in YYYY-MM-DD
export const utcTimeToLocal = (timeUtc: string, date: string): string => {
  const utcDateTime = new Date(`${date}T${timeUtc}Z`);
  return utcDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// for use with time strings that need to preserve format
export const utcTimeToLocalSliced = (timeUtc: string, date: string): string => {
  return utcTimeToLocal(timeUtc, date);
};
