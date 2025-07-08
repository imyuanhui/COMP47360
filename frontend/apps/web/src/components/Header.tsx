import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  tripId?: string; // ✅ new
}

export default function Header({ activeTab, tripId }: HeaderProps) {
  const loc = useLocation();

  const tabs = [
  { name: 'Explore Places', path: tripId ? `/explore/${tripId}` : '/' },
  { name: 'My Itinerary',   path: tripId ? `/myitinerary/${tripId}` : '/itinerary' },
  { name: 'Saved Places',   path: tripId ? `/saved/${tripId}` : '/' },
  { name: 'Update Preferences', path: '/preferences' },
];


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
