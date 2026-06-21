'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useLanguage } from '../contexts/LanguageContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Person = { name: string; ip: string };

export const SettingsModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    fetch('/api/config')
      .then(res => res.json())
      .then((config: Record<string, string>) => {
        setPeople(Object.entries(config).map(([name, ip]) => ({ name, ip })));
      })
      .catch(() => setError('Failed to load config'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const updatePerson = (index: number, field: keyof Person, value: string) => {
    setPeople(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPerson = () => setPeople(prev => [...prev, { name: '', ip: '' }]);

  const removePerson = (index: number) => {
    setPeople(prev => prev.filter((_, i) => i !== index));
    setConfirmDelete(null);
  };

  const handleSave = async () => {
    const config: Record<string, string> = {};
    for (const { name, ip } of people) {
      if (!name.trim() || !ip.trim()) {
        setError(t('settings.empty'));
        return;
      }
      config[name.trim()] = ip.trim();
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save');
      router.refresh();
      onClose();
    } catch {
      setError('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <DialogTitle className="text-xl font-semibold text-white">{t('settings.title')}</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-medium text-zinc-500 mb-3">{t('settings.people')}</h3>

            {loading ? (
              <div className="text-center py-8 text-zinc-600">...</div>
            ) : (
              <>
                {people.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600">{t('settings.empty')}</div>
                ) : (
                  <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
                    {people.map((person, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={person.name}
                          onChange={e => updatePerson(i, 'name', e.target.value)}
                          placeholder={t('settings.namePlaceholder')}
                          className="flex-1 min-w-0 rounded-lg bg-zinc-950/50 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        <input
                          value={person.ip}
                          onChange={e => updatePerson(i, 'ip', e.target.value)}
                          placeholder={t('settings.ipPlaceholder')}
                          className="flex-1 min-w-0 rounded-lg bg-zinc-950/50 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        <button
                          onClick={() => setConfirmDelete(i)}
                          title={t('settings.delete')}
                          className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={addPerson}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t('settings.add')}
                </button>

                {error && <p className="text-sm text-rose-400 mt-4">{error}</p>}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-800">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                  >
                    {saving ? t('settings.saving') : t('settings.save')}
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogPanel>
      </div>

      <Dialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-6">
            <DialogTitle className="text-lg font-semibold text-white mb-2">{t('settings.deleteConfirm.title')}</DialogTitle>
            <p className="text-sm text-zinc-400 mb-6">{t('settings.deleteConfirm.description')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => confirmDelete !== null && removePerson(confirmDelete)}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              >
                {t('settings.deleteConfirm.button')}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Dialog>
  );
};
