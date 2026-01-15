'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import dynamic from 'next/dynamic';
import { DayData, formatDuration } from '../lib/sessions';

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
  if (!data) return null;

  const { person, date, dayData, color } = data;
  const { sessions, totalMinutes, firstSeen, lastSeen, stillConnected } = dayData;

  const timelineData = sessions.map((session, i) => ({
    x: `Session ${i + 1}`,
    y: [
      new Date(`${date}T${session.start}`).getTime(),
      session.end
        ? new Date(`${date}T${session.end}`).getTime()
        : new Date(`${date}T${session.start}`).getTime() + session.durationMinutes * 60 * 1000,
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
      min: new Date(`${date}T00:00:00`).getTime(),
      max: new Date(`${date}T23:59:59`).getTime(),
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
              <StatCard label="First Seen" value={firstSeen?.slice(0, 5) || '-'} />
              <StatCard
                label="Last Seen"
                value={lastSeen?.slice(0, 5) || '-'}
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sessions.map((session, i) => (
                    <SessionRow key={i} session={session} color={color} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-zinc-600">No session data available</div>
            )}
          </div>
        </DialogPanel>
      </div>
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
};

const SessionRow = ({ session, color }: SessionRowProps) => (
  <div className="flex items-center justify-between bg-zinc-950/50 rounded-lg px-4 py-3 border border-zinc-800">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-white font-medium">{session.start.slice(0, 5)}</span>
      <span className="text-zinc-600">→</span>
      <span className="text-white font-medium">
        {session.end ? session.end.slice(0, 5) : <span className="text-emerald-400">Connected</span>}
      </span>
    </div>
    <span className="text-zinc-500">{formatDuration(session.durationMinutes)}</span>
  </div>
);
