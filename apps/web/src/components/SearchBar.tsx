// src/components/SearchBar.tsx
import React, { useState } from 'react';

interface Props {
  onSearch: (q: string) => void;
  onFilterChange: (filters: string[]) => void;
}

export default function SearchBar({ onSearch, onFilterChange }: Props) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Enter a place or thing to search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch(query)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Filters
      </button>

      {showFilters && (
        <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold mb-2">Filter Your Search</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {['Restaurant', 'Museum', 'Popular', 'Hidden Gem'].map(opt => (
              <li key={opt} className="flex items-center">
                <input
                  type="checkbox"
                  id={opt}
                  className="mr-2"
                  onChange={e => {
                    const next = e.currentTarget.checked
                      ? [...[] /* omitted: actual state */ , opt]
                      : [] /* remove logic */
                    onFilterChange(next);
                  }}
                />
                <label htmlFor={opt}>{opt}</label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
