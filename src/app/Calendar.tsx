"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChartBarIcon, Cog6ToothIcon, LinkIcon } from "@heroicons/react/20/solid";
import type { CheckInsData } from "./page";
import { DayData, formatDuration } from "./lib/sessions";
import { getPersonColor, getMonths, getWeekdays } from "./lib/constants";
import { MonthYearSelector } from "./components/MonthYearSelector";
import { SessionModal, ModalData } from "./components/SessionModal";
import { ReportsModal } from "./components/ReportsModal";
import { SettingsModal } from "./components/SettingsModal";
import { useLanguage } from "./contexts/LanguageContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

type CalendarProps = {
  checkIns: CheckInsData;
};

export const Calendar = ({ checkIns }: CalendarProps) => {
  const router = useRouter();
  const { t } = useLanguage();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalData, setModalData] = useState<ModalData>(null);
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [joinConfirm, setJoinConfirm] = useState<{ person: string; date: string } | null>(null);
  const [joining, setJoining] = useState(false);

  const people = Object.keys(checkIns).sort();
  const MONTHS = getMonths(t);
  const WEEKDAYS = getWeekdays(t);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  useEffect(() => {
    setModalData((prev) => {
      if (prev) {
        const updatedDayData = checkIns[prev.person]?.[prev.date];
        if (updatedDayData) {
          return { ...prev, dayData: updatedDayData };
        }
      }
      return prev;
    });
  }, [checkIns]);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const years = Array.from(
    { length: 10 },
    (_, i) => today.getFullYear() - 5 + i
  );

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getCheckInsForDay = (day: number) =>
    people.filter((person) => {
      const dayData = checkIns[person]?.[formatDateStr(day)];
      return dayData && dayData.totalMinutes > 0;
    });

  const getDayData = (person: string, day: number): DayData | null =>
    checkIns[person]?.[formatDateStr(day)] || null;

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const handleBadgeClick = (person: string, day: number) => {
    const dayData = getDayData(person, day);
    if (dayData) {
      const color = getPersonColor(person, people);
      setModalData({
        person,
        date: formatDateStr(day),
        dayData,
        color: color.hex,
      });
    }
  };

  const handleJoinAll = async () => {
    if (!joinConfirm) return;
    setJoining(true);
    try {
      const response = await fetch("/api/merge-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...joinConfirm, mergeAll: true }),
      });
      if (!response.ok) throw new Error("Failed to join sessions");
      router.refresh();
      setJoinConfirm(null);
    } catch (error) {
      console.error("Error joining sessions:", error);
      alert("Failed to join sessions");
    } finally {
      setJoining(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  };

  return (
    <div className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        {/* <div className="flex items-center justify-between mb-8"> */}
        {/*   <h1 className="text-3xl font-bold text-white"> */}
        {/*     {t("calendar.title")} */}
        {/*   </h1> */}
        {/*   <LanguageSwitcher /> */}
        {/* </div> */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <MonthYearSelector
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            years={years}
            months={MONTHS}
          />

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button
              onClick={() => setShowReports(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <ChartBarIcon className="h-5 w-5" />
              <span>{t("calendar.reports")}</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              title={t("calendar.settings")}
              className="flex items-center justify-center p-2.5 rounded-lg bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>

            <LanguageSwitcher />
          </div>
        </div>

        {people.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            {people.map((person) => {
              const color = getPersonColor(person, people);
              return (
                <div
                  key={person}
                  className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                  <span className="text-sm text-zinc-400">{person}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-800">
          <div className="grid grid-cols-7 border-b border-zinc-800">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-zinc-500 bg-zinc-900/50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-28 border-b border-r border-zinc-800/50 bg-zinc-950/30"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayCheckIns = getCheckInsForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-28 border-b border-r border-zinc-800/50 p-2 ${isCurrentDay ? "bg-white/5" : "bg-zinc-900/30"}`}>
                  <div
                    className={`text-sm mb-1 ${isCurrentDay ? "font-bold text-white" : "text-zinc-600"}`}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayCheckIns.map((person) => {
                      const color = getPersonColor(person, people);
                      const dayData = getDayData(person, day);
                      const sessionCount = dayData?.sessions.length ?? 0;
                      return (
                        <div
                          key={person}
                          className={`rounded ${color.bg} overflow-hidden`}>
                          <button
                            onClick={() => handleBadgeClick(person, day)}
                            className="w-full text-xs px-2 py-1 text-white truncate text-left hover:opacity-80 transition-opacity cursor-pointer">
                            {person}
                            {dayData && dayData.totalMinutes > 0 && (
                              <span className="ml-1 opacity-75">
                                · {formatDuration(dayData.totalMinutes)}
                              </span>
                            )}
                          </button>
                          {sessionCount > 1 && (
                            <div className="flex items-center justify-between gap-1 px-2 pb-1 -mt-0.5">
                              <span className="text-[10px] text-white/70">
                                {sessionCount} {t("calendar.entries")}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setJoinConfirm({
                                    person,
                                    date: formatDateStr(day),
                                  });
                                }}
                                title={t("calendar.joinAll")}
                                className="shrink-0 text-white/70 hover:text-white transition-colors cursor-pointer">
                                <LinkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
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

      <SessionModal
        data={modalData}
        onClose={() => setModalData(null)}
        formatDate={formatDateDisplay}
      />
      <ReportsModal
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        checkIns={checkIns}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <Dialog
        open={joinConfirm !== null}
        onClose={() => setJoinConfirm(null)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-6">
            <DialogTitle className="text-lg font-semibold text-white mb-2">
              {t("session.mergeAll.title")}
            </DialogTitle>
            <p className="text-sm text-zinc-400 mb-6">
              {t("session.mergeAll.description")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setJoinConfirm(null)}
                disabled={joining}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50">
                {t("common.cancel")}
              </button>
              <button
                onClick={handleJoinAll}
                disabled={joining}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50">
                {joining ? t("session.merge.merging") : t("session.mergeAll.button")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};
