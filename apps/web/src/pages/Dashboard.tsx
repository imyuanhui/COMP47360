// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Trip {
  name: string;
  startDate: Date;
  endDate: Date;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<DateValueType>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const navigate = useNavigate();

  // load trips from localStorage
  const [myTrips, setMyTrips] = useState<Trip[]>(() => {
    try {
      const stored = localStorage.getItem("myTrips");
      if (stored) {
        return JSON.parse(stored, (key, val) => {
          if (key === "startDate" || key === "endDate") return new Date(val);
          return val;
        });
      }
    } catch {}
    return [];
  });

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem("myTrips", JSON.stringify(myTrips));
  }, [myTrips]);

  // fake loading skeleton
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handlePlanTrip = () => setShowPlanModal(true);
  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSaveTrip = () => {
    if (!newTripName.trim()) return toast.error("Please enter a trip name.");
    const sd = (selectedDate as any).startDate as Date;
    const ed = (selectedDate as any).endDate as Date;
    if (!sd || !ed) return toast.error("Please select dates.");
    setMyTrips([...myTrips, { name: newTripName, startDate: sd, endDate: ed }]);
    toast.success("Trip added!");
    setShowPlanModal(false);
    setNewTripName("");
    navigate("/explore");
  };

  const handleDeleteTrip = (idx: number) => {
    setMyTrips(myTrips.filter((_, i) => i !== idx));
    toast.success("Trip deleted");
  };

  const trendingTrips = [
    { title: "Central Park Highlights", image: "centralpark.jpeg" },
    { title: "Downtown Explorer",        image: "downtown.jpg"    },
    { title: "Uptown Culture Walk",      image: "uptown.jpg"      },
    { title: "Manhattan Nightlife",      image: "nightlife.jpg"   },
    { title: "Historical Manhattan",     image: "history.jpg"     },
    { title: "Hidden Gems Tour",         image: "hidden.jpg"      },
    { title: "Downtown Explorer",        image: "downtown.jpg"    },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans animate-fadeIn overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Profile Panel (stub) */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
            <div className="relative h-full w-[330px] bg-white p-6 shadow-2xl animate-slideInRight overflow-y-auto">
              {/* your profile content here */}
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
              >
                ✕
              </button>
              {/* ... */}
            </div>
          </div>
        )}

        {/* Plan Trip Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Plan New Trip</h2>
              <input
                type="text"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="Enter trip name"
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <Datepicker
                value={selectedDate}
                onChange={setSelectedDate}
                displayFormat="DD.MM.YYYY"
              />
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTrip}
                  className="px-4 py-2 bg-[#03253D] text-white rounded hover:bg-[#021B2B]"
                >
                  Save & Explore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className="h-8 w-8 rounded-full"
            />
            <span className="text-xl font-bold">SmartTrip NYC</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={handleLogout} className="hover:text-blue-600">
              Logout
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="bg-[#03253D] text-white px-4 py-1 rounded-full hover:bg-[#021b2b]"
            >
              Profile
            </button>
          </div>
        </header>

        {/* Filters + Plan */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Sort by</label>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Popular</option>
                <option>Recent</option>
                <option>Top Rated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Restaurant</option>
                <option>Museum</option>
                <option>Hidden Gem</option>
              </select>
            </div>
          </div>
          <button
            onClick={handlePlanTrip}
            className="rounded-full bg-[#03253D] text-white px-6 py-2 text-sm shadow-lg hover:scale-105 hover:bg-[#021B2B] transition"
          >
            + Plan a new trip
          </button>
        </div>

        {/* Trending + TikTok */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          {loading
            ? Array(7)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 animate-pulse w-[265px] h-[259px] rounded-lg"
                  />
                ))
            : trendingTrips.map((t, idx) =>
                idx === 1 ? (
                  <div
                    key={idx}
                    className="col-span-1 row-span-2 bg-white border shadow hover:shadow-xl transform hover:scale-105 transition rounded-lg w-[265px] h-[540px] relative group"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded transition">
                      View Details
                    </div>
                    <img
                      src="/assets/thumb.png"
                      alt="Feature"
                      className="w-full h-5/6 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                      <img
                        src="/assets/tiktok.png"
                        alt="TikTok"
                        className="w-6 h-6 mb-1"
                      />
                      <p className="text-white font-bold drop-shadow text-lg">
                        Top 5 Cheap Burgers in NYC
                      </p>
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs text-white drop-shadow">
                      @SmartTrip NYC
                    </div>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      Simon Maybury · a month ago
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="bg-white border shadow flex flex-col justify-between p-2 text-sm text-gray-700 hover:shadow-xl transform hover:scale-105 transition rounded-lg w-[265px] h-[259px] relative group"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded transition">
                      View Details
                    </div>
                    <img
                      src={`/assets/${t.image}`}
                      alt={t.title}
                      className="w-full h-4/6 object-cover rounded-md"
                    />
                    <div className="h-2/6 flex flex-col justify-center items-center">
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-xs text-gray-500">
                        dd.mm.yyyy | 3 places
                      </p>
                    </div>
                  </div>
                )
              )}
        </div>

        {/* My Trips */}
        <div>
          <h2 className="text-xl font-bold mb-4">My Trips</h2>
          <div className="grid grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => {
              const trip = myTrips[idx];
              return (
                <div
                  key={idx}
                  className="bg-white border shadow flex flex-col justify-center items-center p-4 text-center text-gray-700 hover:shadow-lg transform hover:scale-105 transition rounded-lg w-[265px] h-[259px] relative group"
                >
                  <div
                    onClick={() => handleDeleteTrip(idx)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 cursor-pointer text-xs bg-black bg-opacity-70 text-white px-1 py-0.5 rounded transition"
                  >
                    🗑️
                  </div>
                  {trip ? (
                    <>
                      <p className="font-semibold">{trip.name}</p>
                      <p className="text-xs text-gray-500">
                        {trip.startDate.toLocaleDateString()} – 
                        {trip.endDate.toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">No Trip</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
