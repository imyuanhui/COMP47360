/**************************************************************
 * Layout.tsx
 * -----------------------------------------------------------------
 * Generic 2-pane shell used by Explore Places, Saved Places, etc.
 *
 *  ┌───────────────────────────────────┐
 *  │  HEADER (logo + links)           │  ⭠ fixed height
 *  ├───────────────────────────────────┤
 *  │  HERO (banner image)             │  ⭠ fixed height
 *  ├───────────────────────────────────┤
 *  │  TABS (Explore / Saved / …)      │  ⭠ auto height
 *  ├───────────────────────────────────┤
 *  │                                   │
 *  │  SCROLLABLE MAIN CONTENT          │  ⭠ grows / scrolls
 *  │                                   │
 *  ├───────────────────────────────────┤
 *  │  FOOTER                           │  ⭠ fixed height
 *  └───────────────────────────────────┘
 *
 *  Right-hand pane simply receives a React node (`right`) and
 *  consumes the remaining 50 % width.
 *************************************************************/

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ----------------------------- props ----------------------------- */
interface Props {
  activeTab: string;
  tripName: string;
  tripDate: string;
  tripId?: string; // ✅ add this
  left: React.ReactNode;
  right: React.ReactNode;
  heroCollapsed?: boolean;
}

export default function Layout({ 
  activeTab, 
  left, 
  right, 
  tripName, 
  tripDate, 
  tripId, 
  heroCollapsed = false 
}: Props) {

  const navigate = useNavigate();
  const [isMapVisible, setIsMapVisible] = useState(false); // 🆕 mobile map visibility toggle

  /* Tab labels + target route.  Easy to extend later. */
  const tabs = [
    { label: 'Explore Places',     path: tripId ? `/explore/${tripId}` : '/' },
    { label: 'My Itinerary',       path: tripId ? `/myitinerary/${tripId}` : '/itinerary' },
    { label: 'Saved Places', path: tripId ? `/saved/${tripId}` : '/' },
  ];

  return (
    <>
      {/* 🆕 Toggle Map button – always visible on mobile, above the map */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <button
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="w-full bg-[#022c44] px-0 py-3 text-sm font-semibold text-white shadow-inner"
        >
          {isMapVisible ? 'Close Map' : 'Show Map'}
        </button>
      </div>

      <div className="h-screen overflow-x-hidden overflow-y-auto md:flex">
        {/* ───────────────────────── LEFT PANE ───────────────────────── */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-gray-200">

          {/* 1️⃣  Top-of-page header */}
          <header className="flex items-center justify-between px-6 py-4">
            {/* brand / logo → go to dashboard on click */}
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80">
              <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
              <span className="text-lg font-bold">SmartTrip NYC</span>
            </Link>

            {/* quick links (no routing library needed) */}
            <div className="space-x-4 text-sm">
              <button onClick={() => navigate('/dashboard')}   className="hover:underline">Dashboard</button>
              <button onClick={() => navigate('/')}          className="hover:underline">Logout</button>
            </div>
          </header>

          {/* 2️⃣  Hero banner (dark overlay improves text contrast) */}
          <div className="px-6 pb-4">
            <div
              className=  {`relative w-full overflow-hidden rounded-[10px] 
                        bg-cover bg-center transition-all duration-300
                        ${heroCollapsed ? 'h-32' : 'h-32 md:h-64'}`}
              style={{ backgroundImage: "url('/assets/hero.jpg')" }}
            >
              <div className="absolute inset-0 flex items-end bg-black/30 p-6">
                <div>
                  <h2 className="text-3xl font-semibold text-white">
                    {tripName || 'Your Trip'}
                  </h2>
                  {tripDate && (
                    <div className="mt-1 text-sm text-gray-200">
                      {tripDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3️⃣  Tab navigation */}
          <nav className="relative z-20 bg-white">
          <ul className="flex space-x-8 px-6 pt-0 pb-2 text-sm md:text-base">
              {tabs.map(t => (
                <li key={t.label}>
                  <Link
                    to={t.path}
                    /* underline + colour when active */
                    className={`pb-1 ${
                      activeTab === t.label
                        ? 'border-b-2 border-[#032c45] font-semibold text-[#032c45]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 4️⃣  Scrollable wrapper CONTAINS the footer */}
          <div
            className="flex-1 overflow-y-auto flex flex-col"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`div::-webkit-scrollbar{display:none}`}</style>

            {/* main page content */}
            <div className="px-6 py-4 flex-1">
              {left}
            </div>

            {/* 5️⃣  Footer lives at the very bottom of this scroll area */}
            <footer className="mt-auto px-6 py-4 text-center text-sm text-gray-400">
              Sign Up &nbsp;|&nbsp; Contact&nbsp;Us &nbsp;|&nbsp; FAQs
            </footer>
          </div>
        </div>

        {/* ──────────────────────── RIGHT PANE ───────────────────────── */}
        <div className={`md:block ${isMapVisible ? 'fixed inset-0 z-40 block' : 'hidden'} md:static md:w-1/2 h-screen bg-white shadow-lg transition-transform duration-300`}>
          {/* map content */}
          <div className="h-full w-full">
            {right}
          </div>
        </div>
      </div>
    </>
  );
}
