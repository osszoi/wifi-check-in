'use client';

import { useState } from 'react';
import { ChartBarIcon } from '@heroicons/react/20/solid';
import type { CheckInsData } from './page';
import { DayData, formatDuration } from './lib/sessions';
import { MONTHS, WEEKDAYS, getPersonColor } from './lib/constants';
import { MonthYearSelector } from './components/MonthYearSelector';
import { SessionModal, ModalData } from './components/SessionModal';
import { ReportsModal } from './components/ReportsModal';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

type CalendarProps = {
  checkIns: CheckInsData;
};

export const Calendar = ({ checkIns }: CalendarProps) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalData, setModalData] = useState<ModalData>(null);
  const [showReports, setShowReports] = useState(false);

  const people = Object.keys(checkIns).sort();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getCheckInsForDay = (day: number) =>
    people.filter(person => {
      const dayData = checkIns[person]?.[formatDateStr(day)];
      return dayData && dayData.totalMinutes > 0;
    });

  const getDayData = (person: string, day: number): DayData | null =>
    checkIns[person]?.[formatDateStr(day)] || null;

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleBadgeClick = (person: string, day: number) => {
    const dayData = getDayData(person, day);
    if (dayData) {
      const color = getPersonColor(person, people);
      setModalData({ person, date: formatDateStr(day), dayData, color: color.hex });
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  };

  return (
    <div className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">WiFi Check-ins</h1>

        <div className="flex items-center justify-between mb-6">
          <MonthYearSelector
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            years={years}
          />
          <button
            onClick={() => setShowReports(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Reports</span>
          </button>
        </div>

        {people.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            {people.map(person => {
              const color = getPersonColor(person, people);
              return (
                <div key={person} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                  <span className="text-sm text-zinc-400">{person}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-800">
          <div className="grid grid-cols-7 border-b border-zinc-800">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-zinc-500 bg-zinc-900/50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-28 border-b border-r border-zinc-800/50 bg-zinc-950/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayCheckIns = getCheckInsForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-28 border-b border-r border-zinc-800/50 p-2 ${isCurrentDay ? 'bg-white/5' : 'bg-zinc-900/30'}`}
                >
                  <div className={`text-sm mb-1 ${isCurrentDay ? 'font-bold text-white' : 'text-zinc-600'}`}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayCheckIns.map(person => {
                      const color = getPersonColor(person, people);
                      const dayData = getDayData(person, day);
                      return (
                        <button
                          key={person}
                          onClick={() => handleBadgeClick(person, day)}
                          className={`text-xs px-2 py-1 rounded ${color.bg} text-white truncate text-left hover:opacity-80 transition-opacity cursor-pointer`}
                        >
                          {person}
                          {dayData && dayData.totalMinutes > 0 && (
                            <span className="ml-1 opacity-75">· {formatDuration(dayData.totalMinutes)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SessionModal data={modalData} onClose={() => setModalData(null)} formatDate={formatDateDisplay} />
      <ReportsModal isOpen={showReports} onClose={() => setShowReports(false)} checkIns={checkIns} />
    </div>
  );
};
