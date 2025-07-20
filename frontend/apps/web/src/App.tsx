// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import axios from "axios";
import { setAuthToken } from "./services/api";

// Page Imports
import LandingPage from "./pages/Landingpage";
import Dashboard from "./pages/Dashboard";
import ExplorePlaces from "./pages/ExplorePlaces";
import MyItinerary from "./pages/MyItinerary";
import SavedPlaces from "./pages/SavedPlaces";
import Preferences from "./pages/Preferences";
import OAuth2Redirect from "./pages/Oauth";

export default function App() {
  // set initial accessToken header
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  // refresh accessToken every 5 mins
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      try {
        const res = await axios.post("/api/token/refresh", {
          refreshToken,
        });
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        setAuthToken(newAccessToken);
      } catch (err) {
        console.error("Token refresh failed", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 750,
          style: {
            background: "#333",
            color: "#fff",
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
        <Route path="/oauth-success" element={<OAuth2Redirect />} />
        <Route path="/preferences" element={<Preferences />} />
        {/* <Route path="/oauth2/redirect" element={<OAuth2Redirect />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
