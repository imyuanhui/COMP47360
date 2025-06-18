// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  fetchTrendingTrips,
  fetchMyTrips,
  planTrip,
  logout as apiLogout,
} from "../api";

interface Trip {
  id: string;
  title: string;
  image: string;
  date?: string;       
  author?: string;
  timestamp?: string;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<DateValueType>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [trendingTrips, setTrendingTrips] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [trending, mine] = await Promise.all([
          fetchTrendingTrips(),
          fetchMyTrips(),
        ]);
        setTrendingTrips(trending);
        setMyTrips(mine);
      } catch {
        toast.error("Failed to load trips");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePlanTrip = async () => {
    try {
      const result = await planTrip({
        dateRange: selectedDate,
        categories: [],
      });
      toast.success(`Trip planned (ID: ${result.tripId})`);
      const updated = await fetchMyTrips();
      setMyTrips(updated);
    } catch {
      toast.error("Failed to plan trip");
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans animate-fadeIn overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6">

        {showProfile && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
            <div className="relative h-full w-[330px] bg-white shadow-2xl p-6 animate-slideInRight overflow-y-auto">
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
              >✕</button>
              <div className="w-full h-28 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-md mb-6" />
              <div className="text-center -mt-16">
                <img
                  src="/assets/profile-pic.png"
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-md object-cover"
                />
                <h3 className="text-lg font-bold mt-2">John Doe</h3>
                <p className="text-sm text-gray-500">Premium Subscriber</p>
              </div>
              <div className="mt-6 space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3"><span>📧</span><span>john.doe@example.com</span></div>
                <div className="flex items-center gap-3"><span>📱</span><span>+1 234 567 8901</span></div>
                <div className="flex items-center gap-3"><span>📍</span><span>New York, USA</span></div>
              </div>
              <div className="my-4 border-t pt-4">
                <h4 className="text-sm text-gray-500 mb-2">Account Features</h4>
                <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
                  <li>Priority Support</li>
                  <li>Unlimited Trip Planning</li>
                  <li>Early Access to Features</li>
                </ul>
              </div>
              <button className="mt-6 w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition shadow">
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
            <h1 className="text-2xl font-bold">SmartTrip NYC</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <button onClick={() => setShowProfile(true)} className="hover:text-black transition">Profile</button>
            <button className="hover:text-black transition">Settings</button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition">Logout</button>
          </div>
        </header>

        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-8 items-start">
            <div>
              <label className="block font-semibold mb-1 text-sm">Sort by</label>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Popular</option>
                <option>Recent</option>
                <option>Top Rated</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-sm">Categories</label>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Restaurant</option>
                <option>Museum</option>
                <option>Hidden Gem</option>
              </select>
            </div>
          </div>
          <button
            onClick={handlePlanTrip}
            className="rounded-full bg-[#032f55] text-white px-6 py-2 text-sm shadow-lg hover:scale-105 hover:bg-[#021d34] transition-transform"
          >
            + Plan a new trip
          </button>
        </div>

        <div className="grid grid-cols-4 gap-8 auto-rows-[259px] mb-12 justify-items-center">
          {loading
            ? new Array(7).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse w-[265px] h-[259px] rounded-[10px]" />
              ))
            : trendingTrips.map((trip, i) => {
                if (i === 1) {
                  return (
                    <React.Fragment key="tiktok">
                      <div className="col-span-4 text-center font-medium text-gray-800 text-sm mb-[-16px]">
                        Watch Other User’s Days on TikTok
                      </div>
                      <div className="col-span-1 row-span-2 bg-white shadow-md border text-center text-sm text-gray-700 hover:shadow-xl transform hover:scale-105 transition rounded-[10px] w-[265px] h-[540px] group relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded transition">
                          View Details
                        </div>
                        <div className="relative h-5/6 w-full overflow-hidden rounded-md">
                          <img src="/assets/thumb.png" alt="TikTok Feature" className="object-cover w-full h-full" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                            <img src="/assets/tiktok.png" alt="TikTok" className="w-5 h-5 mb-1" />
                            <p className="text-white font-bold text-lg drop-shadow">
                              Top 5 Cheap Burgers in NYC
                            </p>
                          </div>
                          <div className="absolute bottom-2 left-2 text-white text-xs font-semibold drop-shadow">
                            @SmartTrip NYC
                          </div>
                        </div>
                        <div className="text-xs mt-2 text-gray-600">
                          Simon Maybury · a month ago
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }
                return (
                  <div
                    key={trip.id}
                    className="bg-white shadow-md border text-center text-sm text-gray-700 flex flex-col justify-between p-2 hover:shadow-xl transition transform hover:scale-105 cursor-pointer w-[265px] h-[259px] rounded-[10px] group relative"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded transition">
                      View Details
                    </div>
                    <img
                      src={`/assets/${trip.image}`}
                      alt={trip.title}
                      className="h-4/6 w-full object-cover rounded-md"
                    />
                    <div className="h-2/6 flex flex-col justify-center items-center">
                      <p className="font-semibold">{trip.title}</p>
                      <p className="text-xs text-gray-500">
                        {trip.date ?? "dd.mm.yyyy"} | 3 places
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">My Trips</h2>
          <div className="grid grid-cols-3 gap-8 justify-items-center">
            {myTrips.map((trip, index) =>
              trip ? (
                <div
                  key={trip.id}
                  className="group relative bg-white border shadow-md text-center text-sm text-gray-600 p-2 flex flex-col justify-center transition transform hover:scale-105 hover:shadow-xl cursor-pointer w-[265px] h-[259px] rounded-[10px]"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded transition">
                    View Details
                  </div>
                  <img
                    src={`/assets/${trip.image}`}
                    alt={trip.title}
                    className="h-4/6 w-full object-cover rounded-md mb-2"
                  />
                  <div>
                    <p className="font-semibold">{trip.title}</p>
                    <p className="text-xs">{trip.date ?? "dd.mm.yyyy"} | 3 places</p>
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  className="bg-gray-200 animate-pulse w-[265px] h-[259px] rounded-[10px]"
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
