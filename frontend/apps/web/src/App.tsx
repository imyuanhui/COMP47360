// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import OAuth2Redirect from './pages/OAuth2Redirect';

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
        position="top-center"
        toastOptions={{
          duration: 750,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myitinerary/:tripId" element={<MyItinerary />} />
        <Route path="/explore/:tripId" element={<ExplorePlaces />} />

        <Route path="/itinerary" element={<MyItinerary />} />
        <Route path="/saved/:tripId" element={<SavedPlaces />} />

        <Route path="/preferences" element={<Preferences />} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
