// src/pages/Preferences.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MapPane from '../components/MapPane';
import { fetchPreferences, updatePreferences } from '../services/api';
import type { Preferences } from '../types';

export default function Preferences() {
  const [prefs, setPrefs] = useState<Preferences>({ categories: [] });
  const [saving, setSaving] = useState(false);

  // load current prefs
  useEffect(() => {
    fetchPreferences()
      .then(setPrefs)
      .catch((_) => console.error('Failed to load preferences'));
  }, []);

  // toggle a single category
  const toggleCategory = (cat: string) => {
    setPrefs((p) => {
      const has = p.categories.includes(cat);
      return {
        categories: has
          ? p.categories.filter((c) => c !== cat)
          : [...p.categories, cat],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(prefs);
    } catch {
      console.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const left = (
    <div className="flex flex-col h-full justify-start px-6 py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Preferences</h2>
      <p className="text-sm text-gray-600">
        Select the preferences to match the type of holiday you want. Your current preferences are highlighted.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          'Museum',
          'Restaurant',
          'Park',
          'Art Gallery',
          'Historic Site',
          'Shopping',
          'Nightlife',
          'Hidden Gem',
        ].map((cat) => {
          const active = prefs.categories.includes(cat.toLowerCase());
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat.toLowerCase())}
              className={`
                py-2 px-4 rounded-full border 
                ${active
                  ? 'bg-blue-600 text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
                transition
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`
          mt-auto w-full py-2 rounded-full text-white text-sm
          ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          transition
        `}
      >
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  );

  const right = <MapPane places={[]} onMarkerClick={() => {}} />;

  return (
    <Layout
      activeTab="Update Preferences"
      left={left}
      right={right}
    />
  );
}
