// File: src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  createTrip,
  setAuthToken,
  fetchMyTrips,
  logout as apiLogout,
  fetchProfile,
  deleteTrip,
  updateProfile,
  changePassword,
} from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tripTime, setTripTime] = useState({ start: "09:00", end: "17:00" });
  const [newTripName, setNewTripName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ username: "", email: "", password: "" });
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const [trending] = useState([
    { id: "1", title: "Central Park Highlights", image: "centralpark.jpeg" },
    { id: "2", title: "Top 5 Cheap Burgers", image: "thumb.png" },
    { id: "3", title: "Hidden Bars Crawl", image: "hidden.jpg" },
    { id: "4", title: "NYC Nightlife", image: "nightlife.jpg" },
    { id: "5", title: "Downtown Delights", image: "downtown.jpg" },
    { id: "6", title: "Uptown Explorer", image: "uptown.jpg" },
  ]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  const loadTrips = async () => {
    try {
      const res = await fetchMyTrips();
      setMyTrips(res.Trips || []);
    } catch (err) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleExploreRedirect = async () => {
    if (!selectedDate || !newTripName.trim()) {
      toast.error("Please complete all fields.");
      return;
    }

    const today = new Date();
    const selectedOnlyDate = new Date(selectedDate);
    selectedOnlyDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedOnlyDate < today) {
      toast.error("Please select a valid future date.");
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const startDateTime = `${dateStr}T${tripTime.start}:00`;
      const endDateTime = `${dateStr}T${tripTime.end}:00`;

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return;
      }
      setAuthToken(token);

      await createTrip({
        tripName: newTripName,
        startDateTime,
        endDateTime,
        numTravellers: 1,
        thumbnailUrl: "",
      });

      toast.success("Trip created successfully!");
      setShowModal(false);
      await loadTrips();

      navigate(`/explore?name=${newTripName}&date=${dateStr}&start=${tripTime.start}&end=${tripTime.end}`);
    } catch (err: any) {
      toast.error("Failed to plan trip");
      console.error("Trip creation error:", err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (showProfile) {
      fetchProfile()
        .then((data) => setProfile({ username: data.username, email: data.email, password: "" }))
        .catch(() => toast.error("Failed to load profile"));
    }
  }, [showProfile]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
    } catch (err) {
      console.warn("API logout failed, clearing token anyway");
    } finally {
      localStorage.removeItem("token");
      toast.success("Logged out");
      navigate("/");
      setLoggingOut(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile({ username: profile.username, email: profile.email });
      if (profile.password) {
        await changePassword("dummy-old-password", profile.password); // Replace as needed
      }
      toast.success("Profile updated successfully!");
      setShowProfile(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await deleteTrip(tripId);
      toast.success("Trip deleted");
      await loadTrips();
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Toaster position="top-right" />

      {/* Profile Section */}

{showProfile && (
  <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-gradient-to-b from-blue-50 to-white shadow-2xl z-50 overflow-auto animate-slideIn">
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-extrabold text-[#03253D]">My Profile</h2>
      </div>

      {!editMode ? (
        <>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">Username</p>
            <p className="font-medium text-lg">{profile.username}</p>
            <p className="text-sm text-gray-500 mt-4 mb-1">Email</p>
            <p className="font-medium text-lg">{profile.email}</p>
            <p className="text-sm text-gray-500 mt-4 mb-1">Subscription</p>
            <p className="font-semibold text-green-600">Premium</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowProfile(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded border border-gray-300"
            >
              Close
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
            >
              Edit Profile
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
            <input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">New Password</label>
            <input
              type="password"
              value={profile.password}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setEditMode(false)}
              className="text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleProfileUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}


      <header className="flex justify-between items-center mb-8 px-6 pt-6">
  <div className="flex items-center gap-3">
    <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full" />
    <h1 className="text-2xl font-bold text-[#03253D]">SmartTrip NYC</h1>
  </div>
  <div className="space-x-4">
    <button onClick={() => setShowProfile(true)} className="hover:underline">
      Profile
    </button>
    <button onClick={handleLogout} disabled={loggingOut} className="text-red-600 hover:underline">
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  </div>
</header>
      {/* Plan a new trip */}
      <div className="flex justify-end mb-6 px-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#03253D] text-white px-6 py-2 rounded-full shadow hover:scale-105 transition"
        >
          + Plan a new trip
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Plan a New Trip</h2>
            <input
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
              placeholder="Trip Name"
            />
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              className="w-full border px-3 py-2 rounded mb-3"
            />
            <div className="flex gap-2 mb-4">
              <input
                type="time"
                value={tripTime.start}
                onChange={(e) => setTripTime({ ...tripTime, start: e.target.value })}
                className="flex-1 border px-2 py-1 rounded"
              />
              <input
                type="time"
                value={tripTime.end}
                onChange={(e) => setTripTime({ ...tripTime, end: e.target.value })}
                className="flex-1 border px-2 py-1 rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="text-gray-600">
                Cancel
              </button>
              <button onClick={handleExploreRedirect} className="bg-blue-600 text-white px-4 py-2 rounded">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 px-6">
        {trending.map((t, i) => (
          i === 1 ? (
            <div
              key={t.id}
              className="col-span-1 row-span-2 bg-white shadow-lg rounded-lg overflow-hidden relative group"
            >
              <img src={`/assets/${t.image}`} className="h-96 w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <img src="/assets/tiktok.png" className="w-6 h-6 mb-2" />
                <p className="text-xl font-bold text-center px-2 drop-shadow">{t.title}</p>
              </div>
            </div>
          ) : (
            <div
              key={t.id}
              className="bg-white shadow rounded-lg p-3 hover:shadow-xl transition"
            >
              <img
                src={`/assets/${t.image}`}
                className="h-40 w-full object-cover rounded"
              />
              <p className="mt-2 font-semibold text-center">{t.title}</p>
            </div>
          )
        ))}
      </div>

      {/* My Trips */}
      <h2 className="text-lg font-bold mb-4 px-6">My Trips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-12">
        {myTrips.length === 0 && !loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
  <div
    key={idx}
    className="relative bg-gray-100 h-40 rounded-lg border-dashed border-2 border-gray-300 flex flex-col items-center justify-center text-sm text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 hover:scale-105 hover:shadow-md overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
    <svg
      className="w-8 h-8 mb-1 text-gray-300 group-hover:text-gray-500 transition relative z-10"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    <span className="relative z-10">Empty Trip Slot</span>
  </div>
))

        ) : (
          myTrips.map((trip) => (
            <div
              key={trip.tripId}
              className="bg-white shadow rounded-lg p-4 relative group hover:shadow-xl hover:scale-105 transition transform duration-300"
            >
              <button
                onClick={() => setConfirmDeleteId(trip.tripId)}
                title="Delete trip"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={18} />
              </button>
              <h3 className="font-semibold mb-1">{trip.tripName}</h3>
              <p className="text-sm text-gray-500">
                {new Date(trip.startDateTime).toLocaleDateString()} – {new Date(trip.endDateTime).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this trip?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrip(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
