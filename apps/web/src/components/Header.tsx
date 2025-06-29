// src/components/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { name: 'Explore Places', path: '/explore' },
  { name: 'My Itinerary',   path: '/itinerary' },
  { name: 'Saved Places',   path: '/saved' },
  { name: 'Update Preferences', path: '/preferences' },
];

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const loc = useLocation();
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center space-x-8">
        <div className="text-xl font-bold">SmartTip NYC</div>
        <nav className="space-x-4 text-gray-700">
          {tabs.map(t => (
            <Link
              key={t.path}
              to={t.path}
              className={loc.pathname === t.path ? 'font-semibold' : 'hover:underline'}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      </div>
      <nav className="space-x-4 text-gray-700">
        <a href="#" className="hover:underline">Profile</a>
        <a href="#" className="hover:underline">Settings</a>
        <a href="#" className="hover:underline">Logout</a>
      </nav>
    </header>
  );
}
