'use client';

import { useState } from 'react';

type CheckInsData = Record<string, string[]>;

const COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-fuchsia-500', text: 'text-white' },
  { bg: 'bg-lime-500', text: 'text-white' },
];

const getPersonColor = (person: string, allPeople: string[]) => {
  const index = allPeople.indexOf(person);
  return COLORS[index % COLORS.length];
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarProps = {
  checkIns: CheckInsData;
};

export const Calendar = ({ checkIns }: CalendarProps) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const people = Object.keys(checkIns).sort();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const getCheckInsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return people.filter(person => checkIns[person]?.includes(dateStr));
  };

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">WiFi Check-ins</h1>

        <div className="flex gap-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {people.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {people.map(person => {
              const color = getPersonColor(person, people);
              return (
                <div key={person} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                  <span className="text-sm text-gray-600">{person}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-28 border-b border-r border-gray-100 bg-gray-50/50" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayCheckIns = getCheckInsForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-28 border-b border-r border-gray-100 p-2 ${isCurrentDay ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm mb-1 ${isCurrentDay ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayCheckIns.map(person => {
                      const color = getPersonColor(person, people);
                      return (
                        <div
                          key={person}
                          className={`text-xs px-2 py-1 rounded ${color.bg} ${color.text} truncate`}
                        >
                          {person}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
