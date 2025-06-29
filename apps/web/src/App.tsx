// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage   from './pages/Landingpage';
import Dashboard     from './pages/Dashboard';
import ExplorePlaces from './pages/ExplorePlaces';
import MyItinerary   from './pages/MyItinerary';   // fixed import
import SavedPlaces   from './pages/SavedPlaces';
import Preferences   from './pages/Preferences';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore"   element={<ExplorePlaces />} />  {/* use /explore */}
        <Route path="/itinerary" element={<MyItinerary />} />
        <Route path="/saved"     element={<SavedPlaces />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
