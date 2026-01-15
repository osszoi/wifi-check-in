import type { CheckInsData } from '../page';
import { DayData } from './sessions';

export type PersonMonthlyReport = {
  person: string;
  totalMinutes: number;
  totalDays: number;
  avgMinutesPerDay: number;
  avgDaysPerWeek: number;
  avgMinutesPerWeek: number;
  avgFirstCheckIn: string | null;
  avgLastCheckOut: string | null;
  dailyData: { day: number; minutes: number }[];
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getWeeksInMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();
  return Math.ceil((daysInMonth + firstDayOfWeek) / 7);
};

export const calculateMonthlyReport = (
  checkIns: CheckInsData,
  year: number,
  month: number
): PersonMonthlyReport[] => {
  const people = Object.keys(checkIns).sort();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeksInMonth = getWeeksInMonth(year, month);

  return people.map(person => {
    const personData = checkIns[person] || {};
    let totalMinutes = 0;
    let totalDays = 0;
    const firstCheckIns: number[] = [];
    const lastCheckOuts: number[] = [];
    const dailyData: { day: number; minutes: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData: DayData | undefined = personData[dateStr];

      if (dayData && dayData.totalMinutes > 0) {
        totalMinutes += dayData.totalMinutes;
        totalDays++;
        dailyData.push({ day, minutes: dayData.totalMinutes });

        if (dayData.firstSeen) {
          firstCheckIns.push(timeToMinutes(dayData.firstSeen));
        }
        if (dayData.lastSeen) {
          lastCheckOuts.push(timeToMinutes(dayData.lastSeen));
        }
      } else {
        dailyData.push({ day, minutes: 0 });
      }
    }

    const avgMinutesPerDay = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
    const avgDaysPerWeek = weeksInMonth > 0 ? Math.round((totalDays / weeksInMonth) * 10) / 10 : 0;
    const avgMinutesPerWeek = weeksInMonth > 0 ? Math.round(totalMinutes / weeksInMonth) : 0;

    const avgFirstCheckIn = firstCheckIns.length > 0
      ? minutesToTime(firstCheckIns.reduce((a, b) => a + b, 0) / firstCheckIns.length)
      : null;

    const avgLastCheckOut = lastCheckOuts.length > 0
      ? minutesToTime(lastCheckOuts.reduce((a, b) => a + b, 0) / lastCheckOuts.length)
      : null;

    return {
      person,
      totalMinutes,
      totalDays,
      avgMinutesPerDay,
      avgDaysPerWeek,
      avgMinutesPerWeek,
      avgFirstCheckIn,
      avgLastCheckOut,
      dailyData,
    };
  });
};

export const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};
