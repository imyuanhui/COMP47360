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

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ----------------------------- props ----------------------------- */
interface Props {
  /** Which nav-tab is active (for underline / colour) */
  activeTab: 'Explore Places' | 'My Itinerary' | 'Saved Places' | 'Update Preferences';
  /** React tree for the left scrolling panel (list, search, …) */
  left: React.ReactNode;
  /** React tree for the full-height map or other visual on the right */
  right: React.ReactNode;
}

export default function Layout({ activeTab, left, right }: Props) {
  const navigate = useNavigate();

  /* Tab labels + target route.  Easy to extend later. */
  const tabs = [
    { label: 'Explore Places',     path: '/explore'      },
    { label: 'My Itinerary',       path: '/itinerary'    },
    { label: 'Saved Places',       path: '/saved'        },
    { label: 'Update Preferences', path: '/preferences'  },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ───────────────────────── LEFT PANE ───────────────────────── */}
      <div className="flex w-1/2 flex-col border-r border-gray-200">

        {/* 1️⃣  Top-of-page header */}
        <header className="flex items-center justify-between px-6 py-4">
          {/* brand / logo */}
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
            <span className="text-lg font-bold">SmartTrip NYC</span>
          </div>

          {/* quick links (no routing library needed) */}
          <div className="space-x-4 text-sm text-gray-600">
            <button onClick={() => navigate('/profile')}   className="hover:underline">Profile</button>
            <button onClick={() => navigate('/settings')}  className="hover:underline">Settings</button>
            <button onClick={() => navigate('/')}          className="hover:underline">Logout</button>
          </div>
        </header>

        {/* 2️⃣  Hero banner (dark overlay improves text contrast) */}
        <div className="px-6 pb-4">
          <div
            className="relative h-64 w-full overflow-hidden rounded-[10px] bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/hero.jpg')" }}
          >
            <div className="absolute inset-0 flex items-end bg-black/30 p-6">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  New York with Family
                </h2>
                <div className="mt-1 text-sm text-gray-200">
                  06.12.35&nbsp;|&nbsp;5&nbsp;|&nbsp;<span role="img" aria-label="people">👤</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3️⃣  Tab navigation */}
        <nav className="border-b border-gray-200">
          <ul className="flex space-x-8 px-6 text-base">
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

        {/* 4️⃣  Scrollable main content (search, list, etc.) */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{
            scrollbarWidth: 'none',          // Firefox
            msOverflowStyle: 'none',         // IE/Edge
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;                 // Chrome, Safari
            }
          `}</style>
          {left}
        </div>

        {/* 5️⃣  Footer */}
        <footer className="px-6 py-4 text-center text-sm text-gray-400">
          Sign Up &nbsp;|&nbsp; Contact Us &nbsp;|&nbsp; FAQs
        </footer>
      </div>

      {/* ──────────────────────── RIGHT PANE ───────────────────────── */}
      <div className="h-full w-1/2">
        {right}
      </div>
    </div>
  );
}
