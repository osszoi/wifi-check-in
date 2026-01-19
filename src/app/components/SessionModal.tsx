'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/20/solid';
import dynamic from 'next/dynamic';
import { DayData, formatDuration } from '../lib/sessions';
import { utcTimeToLocal } from '../lib/utils';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export type ModalData = {
  person: string;
  date: string;
  dayData: DayData;
  color: string;
} | null;

type Props = {
  data: ModalData;
  onClose: () => void;
  formatDate: (date: string) => string;
};

export const SessionModal = ({ data, onClose, formatDate }: Props) => {
  const router = useRouter();
  const [confirmMerge, setConfirmMerge] = useState<number | null>(null);
  const [merging, setMerging] = useState(false);

  if (!data) return null;

  const { person, date, dayData, color } = data;
  const { sessions, totalMinutes, firstSeen, lastSeen, stillConnected } = dayData;

  const handleMerge = async (sessionIndex: number) => {
    setMerging(true);
    try {
      const response = await fetch('/api/merge-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person, date, sessionIndex }),
      });

      if (!response.ok) {
        throw new Error('Failed to merge sessions');
      }

      router.refresh();
      setConfirmMerge(null);
    } catch (error) {
      console.error('Error merging sessions:', error);
      alert('Failed to merge sessions');
    } finally {
      setMerging(false);
    }
  };

  const timelineData = sessions.map((session, i) => ({
    x: `Session ${i + 1}`,
    y: [
      new Date(`${date}T${session.start}Z`).getTime(),
      session.end
        ? new Date(`${date}T${session.end}Z`).getTime()
        : new Date(`${date}T${session.start}Z`).getTime() + session.durationMinutes * 60 * 1000,
    ],
  }));

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'rangeBar',
      background: 'transparent',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        borderRadius: 4,
      },
    },
    colors: [color],
    xaxis: {
      type: 'datetime',
      min: new Date(`${date}T00:00:00Z`).getTime(),
      max: new Date(`${date}T23:59:59Z`).getTime(),
      labels: {
        datetimeFormatter: { hour: 'HH:mm' },
        style: { colors: '#71717a' },
      },
    },
    yaxis: {
      labels: { style: { colors: '#71717a' } },
    },
    grid: {
      borderColor: '#27272a',
      xaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'HH:mm' },
    },
    theme: { mode: 'dark' },
  };

  return (
    <Dialog open={!!data} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div>
              <DialogTitle className="text-xl font-semibold text-white">{person}</DialogTitle>
              <p className="text-sm text-zinc-500 mt-1">{formatDate(date)}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard label="Total Time" value={formatDuration(totalMinutes)} />
              <StatCard label="First Seen" value={firstSeen ? utcTimeToLocal(firstSeen, date) : '-'} />
              <StatCard
                label="Last Seen"
                value={lastSeen ? utcTimeToLocal(lastSeen, date) : '-'}
                suffix={stillConnected && <span className="text-xs text-emerald-400 ml-2">● Online</span>}
              />
            </div>

            {sessions.length > 0 ? (
              <>
                <h3 className="text-sm font-medium text-zinc-500 mb-3">Timeline</h3>
                <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-4 mb-6">
                  <Chart
                    options={chartOptions}
                    series={[{ data: timelineData }]}
                    type="rangeBar"
                    height={Math.max(100, sessions.length * 50)}
                  />
                </div>

                <h3 className="text-sm font-medium text-zinc-500 mb-3">Sessions ({sessions.length})</h3>
                <div className="max-h-48 overflow-y-auto">
                  <div className="relative space-y-2">
                    {sessions.map((session, i) => (
                      <div key={i} className="relative">
                        <SessionRow session={session} color={color} date={date} />
                        {i < sessions.length - 1 && session.end && sessions[i + 1].start && (
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-10">
                            <button
                              onClick={() => setConfirmMerge(i)}
                              className="p-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-600 transition-all shadow-lg"
                              title="Merge sessions"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-zinc-600">No session data available</div>
            )}
          </div>
        </DialogPanel>
      </div>

      <Dialog open={confirmMerge !== null} onClose={() => setConfirmMerge(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-6">
            <DialogTitle className="text-lg font-semibold text-white mb-2">Merge Sessions</DialogTitle>
            <p className="text-sm text-zinc-400 mb-6">
              This will fill the gap between these two sessions, treating them as one continuous session. This action will modify the source data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmMerge(null)}
                disabled={merging}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmMerge !== null && handleMerge(confirmMerge)}
                disabled={merging}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {merging ? 'Merging...' : 'Merge'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Dialog>
  );
};

const StatCard = ({ label, value, suffix }: { label: string; value: string; suffix?: React.ReactNode }) => (
  <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
    <div className="text-sm text-zinc-500 mb-1">{label}</div>
    <div className="text-2xl font-bold text-white">
      {value}
      {suffix}
    </div>
  </div>
);

type SessionRowProps = {
  session: { start: string; end: string | null; durationMinutes: number };
  color: string;
  date: string;
};

const SessionRow = ({ session, color, date }: SessionRowProps) => (
  <div className="flex items-center justify-between bg-zinc-950/50 rounded-lg px-4 py-3 border border-zinc-800">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-white font-medium">{utcTimeToLocal(session.start, date)}</span>
      <span className="text-zinc-600">→</span>
      <span className="text-white font-medium">
        {session.end ? utcTimeToLocal(session.end, date) : <span className="text-emerald-400">Connected</span>}
      </span>
    </div>
    <span className="text-zinc-500">{formatDuration(session.durationMinutes)}</span>
  </div>
);
