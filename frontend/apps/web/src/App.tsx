// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // ✅ Added for toast notifications

// Page Imports
import LandingPage from './pages/Landingpage';
import Dashboard from './pages/Dashboard';
import ExplorePlaces from './pages/ExplorePlaces';
import MyItinerary from './pages/MyItinerary';
import SavedPlaces from './pages/SavedPlaces';
import Preferences from './pages/Preferences';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExplorePlaces />} />
        <Route path="/itinerary" element={<MyItinerary />} />
        <Route path="/saved" element={<SavedPlaces />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
