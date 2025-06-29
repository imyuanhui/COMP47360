// src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  fetchMyTrips,
  createTrip,
  logout as apiLogout,
  fetchProfile,
  updateProfile,
  deleteProfile,
} from "../services/api";

// Trending trips data type
interface TrendingTrip {
  id: string;
  title: string;
  image: string;
  date?: string;
}

// ✅ Correct Trip type (matches backend)
interface Trip {
  tripId: number;
  tripName: string;
  startDateTime: string;
  endDateTime: string;
}

// Frontend display type for trips
interface MyTrip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<DateValueType>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [trending, setTrending] = useState<TrendingTrip[]>([
    {
      id: "1",
      title: "Top Museums in NYC",
      image: "museum.png",
    },
    {
      id: "2",
      title: "Cheap Eats Tour",
      image: "food.png",
    },
    {
      id: "3",
      title: "Hidden Bars Crawl",
      image: "bars.png",
    },
    {
      id: "4",
      title: "Scenic Spots",
      image: "scenic.png",
    },
  ]);

  const [myTrips, setMyTrips] = useState<MyTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ username: "", email: "" });

  const navigate = useNavigate();

  // Fetch user's trips
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const res = await fetchMyTrips();
        const trips = res.Trips;

        const mapped = trips.map((t: Trip) => ({
          id: t.tripId.toString(), // ✅ Correct: tripId -> string
          name: t.tripName ?? "Untitled Trip",
          startDate: t.startDateTime,
          endDate: t.endDateTime,
        }));

        setMyTrips(mapped);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  // Fetch profile when drawer opens
  useEffect(() => {
    if (showProfile) {
      fetchProfile()
        .then((data) =>
          setProfile({ username: data.username, email: data.email })
        )
        .catch(() => toast.error("Failed to load profile"));
    }
  }, [showProfile]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ username: profile.username, email: profile.email });
      toast.success("Profile updated");
      setShowProfile(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteProfile = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteProfile();
      toast.success("Account deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handlePlanTrip = async () => {
    if (!selectedDate?.startDate || !selectedDate?.endDate) {
      toast.error("Please select a valid date range.");
      return;
    }

    try {
      const result = await createTrip({
        startDateTime: new Date(selectedDate.startDate).toISOString(),
        endDateTime: new Date(selectedDate.endDate).toISOString(),
        numTravellers: 1, // Required by your type
      });

      const newTrip: MyTrip = {
        id: result.tripId?.toString() ?? crypto.randomUUID(),
        name: result.tripName ?? "Untitled Trip",
        startDate: result.startDateTime,
        endDate: result.endDateTime,
      };

      setMyTrips((prev) => [...prev, newTrip]);
      toast.success("New trip created!");
    } catch {
      toast.error("Failed to plan trip");
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await apiLogout();
      toast.success("Logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans animate-fadeIn overflow-x-hidden">
      <Toaster position="top-right" />

      {/* Profile Drawer */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
          <div className="relative h-full w-[330px] bg-white p-6 shadow-2xl animate-slideInRight overflow-auto">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <p className="text-sm mb-4">Welcome to SmartTrip NYC.</p>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username"
                className="border rounded px-3 py-1 text-sm"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="border rounded px-3 py-1 text-sm"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
              <button
                onClick={handleUpdateProfile}
                className="bg-[#03253D] text-white px-4 py-1 rounded text-sm hover:bg-[#021B2B] transition"
              >
                Update Profile
              </button>
              <button
                onClick={handleDeleteProfile}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-full"
            />
            <h1 className="text-2xl font-bold">SmartTrip NYC</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setShowProfile(true)}
              className="hover:text-gray-800"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Filters & Plan */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Sort by
              </label>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Popular</option>
                <option>Recent</option>
                <option>Top Rated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Categories
              </label>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Restaurant</option>
                <option>Museum</option>
                <option>Hidden Gem</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Dates
              </label>
              <Datepicker
                value={selectedDate}
                onChange={setSelectedDate}
                displayFormat="DD.MM.YYYY"
              />
            </div>
          </div>
          <button
            onClick={handlePlanTrip}
            className="rounded-full bg-[#03253D] text-white px-6 py-2 text-sm shadow-lg hover:scale-105 hover:bg-[#021B2B] transition"
          >
            + Plan a new trip
          </button>
        </div>

        {/* TikTok Divider */}
        <div className="text-center text-sm text-gray-700 mb-4">
          Watch Other User’s Days on TikTok
        </div>

        {/* Trending Grid */}
        <div className="grid grid-cols-4 gap-8 mb-12 justify-items-center">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 animate-pulse w-[265px] h-[259px] rounded-lg"
                />
              ))
            : trending.map((t, i) =>
                i === 1 ? (
                  <div
                    key={t.id}
                    className="col-span-1 row-span-2 w-[265px] h-[540px] bg-white rounded-lg shadow border relative group hover:scale-105 transition"
                  >
                    <img
                      src="/assets/thumb.png"
                      className="object-cover w-full h-5/6 rounded-t-lg"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                      <img
                        src="/assets/tiktok.png"
                        className="w-5 h-5 mb-1"
                      />
                      <p className="font-bold text-lg drop-shadow">
                        Top 5 Cheap Burgers
                      </p>
                    </div>
                    <div className="absolute bottom-4 left-4 text-xs text-white drop-shadow font-semibold">
                      @SmartTrip NYC
                    </div>
                  </div>
                ) : (
                  <div
                    key={t.id}
                    className="w-[265px] h-[259px] bg-white rounded-lg shadow border p-2 flex flex-col justify-between group hover:scale-105 transition"
                  >
                    <img
                      src={`/assets/${t.image}`}
                      className="h-4/6 w-full object-cover rounded-md"
                    />
                    <div className="text-center">
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-xs text-gray-500">
                        {t.date ?? "—"}
                      </p>
                    </div>
                  </div>
                )
              )}
        </div>

        {/* My Trips Section */}
        <section>
          <h2 className="text-lg font-bold mb-4">My Trips</h2>
          <div className="grid grid-cols-4 gap-8 justify-items-center">
            {myTrips.map((m) => (
              <div
                key={m.id}
                className="w-[265px] h-[259px] bg-white rounded-lg shadow border p-4 flex flex-col justify-center group hover:scale-105 transition"
              >
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(m.startDate).toLocaleDateString()} –{" "}
                  {new Date(m.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
