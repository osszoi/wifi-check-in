'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogPanel, DialogTitle, Listbox, ListboxButton, ListboxOption, ListboxOptions, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import dynamic from 'next/dynamic';
import type { CheckInsData } from '../page';
import { MONTHS } from '../lib/constants';
import { calculateMonthlyReport, formatHours, PersonMonthlyReport } from '../lib/reports';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = {
  isOpen: boolean;
  onClose: () => void;
  checkIns: CheckInsData;
};

export const ReportsModal = ({ isOpen, onClose, checkIns }: Props) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const reports = useMemo(() => calculateMonthlyReport(checkIns, year, month), [checkIns, year, month]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
            <DialogTitle className="text-xl font-semibold text-white">Monthly Reports</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex gap-4 mb-6">
              <MonthSelector value={month} onChange={setMonth} />
              <YearSelector value={year} onChange={setYear} years={years} />
            </div>

            {reports.length > 0 ? (
              <TabGroup>
                <TabList className="flex gap-2 mb-6 flex-wrap">
                  {reports.map(report => (
                    <Tab
                      key={report.person}
                      className={({ selected }) =>
                        `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-white text-zinc-900'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`
                      }
                    >
                      {report.person}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  {reports.map(report => (
                    <TabPanel key={report.person}>
                      <PersonReport report={report} year={year} month={month} />
                    </TabPanel>
                  ))}
                </TabPanels>
              </TabGroup>
            ) : (
              <div className="text-center py-12 text-zinc-600">No data available</div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const PersonReport = ({ report, year, month }: { report: PersonMonthlyReport; year: number; month: number }) => {
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false },
    },
    colors: ['#3b82f6'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '70%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: report.dailyData.map(d => d.day),
      labels: { style: { colors: '#71717a' } },
      axisBorder: { color: '#27272a' },
      axisTicks: { color: '#27272a' },
    },
    yaxis: {
      labels: {
        style: { colors: '#71717a' },
        formatter: (val) => formatHours(val),
      },
    },
    grid: {
      borderColor: '#27272a',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => formatHours(val) },
    },
    theme: { mode: 'dark' },
  };

  const chartSeries = [{
    name: 'Time Online',
    data: report.dailyData.map(d => d.minutes),
  }];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Hours" value={formatHours(report.totalMinutes)} />
        <StatCard label="Days Checked In" value={String(report.totalDays)} />
        <StatCard label="Avg Time/Day" value={formatHours(report.avgMinutesPerDay)} />
        <StatCard label="Avg Days/Week" value={String(report.avgDaysPerWeek)} />
        <StatCard label="Avg Time/Week" value={formatHours(report.avgMinutesPerWeek)} />
        <StatCard label="Avg Check-In" value={report.avgFirstCheckIn || '-'} />
        <StatCard label="Avg Check-Out" value={report.avgLastCheckOut || '-'} />
        <StatCard
          label="Active Rate"
          value={`${Math.round((report.totalDays / new Date(year, month + 1, 0).getDate()) * 100)}%`}
        />
      </div>

      <h3 className="text-sm font-medium text-zinc-500 mb-3">Daily Activity</h3>
      <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-4">
        <Chart options={chartOptions} series={chartSeries} type="bar" height={250} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-zinc-500 mt-1">{label}</div>
  </div>
);

const MonthSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <Listbox value={value} onChange={onChange}>
    <div className="relative">
      <ListboxButton className="relative w-36 cursor-pointer rounded-lg bg-zinc-800 py-2 pl-3 pr-10 text-left text-white text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20">
        <span className="block truncate">{MONTHS[value]}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-4 w-4 text-zinc-500" />
        </span>
      </ListboxButton>
      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-zinc-800 py-1 shadow-lg border border-zinc-700 focus:outline-none">
        {MONTHS.map((m, i) => (
          <ListboxOption
            key={m}
            value={i}
            className={({ active }) =>
              `relative cursor-pointer select-none py-2 pl-8 pr-4 text-sm ${active ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`
            }
          >
            {({ selected }) => (
              <>
                <span className={selected ? 'font-medium text-white' : 'font-normal'}>{m}</span>
                {selected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-white">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                )}
              </>
            )}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </div>
  </Listbox>
);

const YearSelector = ({ value, onChange, years }: { value: number; onChange: (v: number) => void; years: number[] }) => (
  <Listbox value={value} onChange={onChange}>
    <div className="relative">
      <ListboxButton className="relative w-24 cursor-pointer rounded-lg bg-zinc-800 py-2 pl-3 pr-10 text-left text-white text-sm border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20">
        <span className="block truncate">{value}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-4 w-4 text-zinc-500" />
        </span>
      </ListboxButton>
      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-zinc-800 py-1 shadow-lg border border-zinc-700 focus:outline-none">
        {years.map(y => (
          <ListboxOption
            key={y}
            value={y}
            className={({ active }) =>
              `relative cursor-pointer select-none py-2 pl-8 pr-4 text-sm ${active ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`
            }
          >
            {({ selected }) => (
              <>
                <span className={selected ? 'font-medium text-white' : 'font-normal'}>{y}</span>
                {selected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-white">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                )}
              </>
            )}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </div>
  </Listbox>
);
