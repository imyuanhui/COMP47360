// src/components/Layout.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  activeTab: 'Explore Places' | 'My Itinerary' | 'Saved Places' | 'Update Preferences';
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function Layout({ activeTab, left, right }: Props) {
  const navigate = useNavigate();
  const tabs = [
    { label: 'Explore Places',       path: '/explore' },
    { label: 'My Itinerary',         path: '/itinerary' },
    { label: 'Saved Places',         path: '/saved' },
    { label: 'Update Preferences',   path: '/preferences' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT PANE: 50% */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        {/* header */}
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
            <span className="text-lg font-bold">SmartTrip NYC</span>
          </div>
          <div className="space-x-4 text-sm text-gray-600">
            <button onClick={() => navigate('/profile')} className="hover:underline">
              Profile
            </button>
            <button onClick={() => navigate('/settings')} className="hover:underline">
              Settings
            </button>
            <button onClick={() => navigate('/')} className="hover:underline">
              Logout
            </button>
          </div>
        </header>

        {/* hero */}
        <div
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/assets/hero.jpg')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center px-6">
            <div>
              <h2 className="text-white text-3xl font-semibold">
                New York with Family
              </h2>
              <div className="text-gray-200 text-sm mt-1">
                06.12.35 | 5&nbsp;|&nbsp;<span>👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* nav tabs */}
        <nav className="border-b border-gray-200">
          <ul className="flex space-x-8 px-6 text-base">
            {tabs.map(t => (
              <li key={t.label}>
                <Link
                  to={t.path}
                  className={`pb-1 ${
                    activeTab === t.label
                      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {left}
        </div>

        {/* footer */}
        <footer className="px-6 py-4 text-center text-sm text-gray-400">
          Sign Up &nbsp;|&nbsp; Contact Us &nbsp;|&nbsp; FAQs
        </footer>
      </div>

      {/* RIGHT PANE: 50% */}
      <div className="w-1/2 h-full">
        {right}
      </div>
    </div>
  );
}
