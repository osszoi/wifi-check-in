'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
];

export const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language) || languages[1];

  return (
    <Listbox value={language} onChange={changeLanguage}>
      <div className="relative">
        <ListboxButton className="relative flex items-center gap-2 cursor-pointer rounded-lg bg-zinc-900 py-2.5 px-3 text-left text-white border border-zinc-800 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20">
          <span className="text-lg">{currentLang.flag}</span>
          <span className="pointer-events-none">
            <ChevronUpDownIcon className="h-5 w-5 text-zinc-500" />
          </span>
        </ListboxButton>
        <ListboxOptions className="absolute right-0 z-10 mt-1 max-h-60 min-w-[140px] overflow-auto rounded-lg bg-zinc-800 py-1 shadow-lg border border-zinc-700 focus:outline-none">
          {languages.map(lang => (
            <ListboxOption
              key={lang.code}
              value={lang.code}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-9 pr-4 ${active ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`
              }
            >
              {({ selected }) => (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span className={selected ? 'font-medium text-white' : 'font-normal'}>{lang.name}</span>
                  </div>
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
};
