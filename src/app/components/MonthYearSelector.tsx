'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { MONTHS } from '../lib/constants';

type Props = {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  years: number[];
};

export const MonthYearSelector = ({ month, year, onMonthChange, onYearChange, years }: Props) => {
  return (
    <div className="flex gap-4">
      <Listbox value={month} onChange={onMonthChange}>
        <div className="relative">
          <ListboxButton className="relative w-40 cursor-pointer rounded-lg bg-zinc-900 py-2.5 pl-4 pr-10 text-left text-white shadow-md border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/20">
            <span className="block truncate">{MONTHS[month]}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-zinc-500" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-zinc-900 py-1 shadow-lg border border-zinc-800 focus:outline-none">
            {MONTHS.map((m, i) => (
              <ListboxOption
                key={m}
                value={i}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}>
                      {m}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      <Listbox value={year} onChange={onYearChange}>
        <div className="relative">
          <ListboxButton className="relative w-28 cursor-pointer rounded-lg bg-zinc-900 py-2.5 pl-4 pr-10 text-left text-white shadow-md border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/20">
            <span className="block truncate">{year}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-zinc-500" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-zinc-900 py-1 shadow-lg border border-zinc-800 focus:outline-none">
            {years.map(y => (
              <ListboxOption
                key={y}
                value={y}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}>
                      {y}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};
