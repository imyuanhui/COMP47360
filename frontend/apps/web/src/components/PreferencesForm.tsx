// src/components/PreferencesForm.tsx
import React, { useState } from 'react';
import type { Preferences } from '../types';

interface Props {
  prefs: Preferences;
  onSubmit: (p: Preferences) => void;
}

export default function PreferencesForm({ prefs, onSubmit }: Props) {
  const options = ['Restaurant', 'Museum', 'Popular', 'Hidden Gem'];
  const [selected, setSelected] = useState<string[]>(prefs.categories);

  const toggle = (opt: string) => {
    setSelected(prev => {
      const next = prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ categories: selected });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {options.map(opt => (
        <label key={opt} className="block">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="mr-2"
          />
          {opt}
        </label>
      ))}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Preferences
      </button>
    </form>
  );
}
