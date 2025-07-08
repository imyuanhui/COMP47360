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
  const [profile, setProfile] = useState({ username: "", email: "", password: "", oldPassword: ""  });
  const [originalProfile, setOriginalProfile] = useState({
  username: "",
  email: ""
});

  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();


const allVideoIds = [
  "7438833662516383006", "7452843363255979286", "7283792903828802859",
  "7386346933046021406", "7366414147325791534", "7523011556087483678"
];

const [shuffledVideos, setShuffledVideos] = useState<string[]>([]);
const [showSmartModal, setShowSmartModal] = useState(false);
const [smartInput, setSmartInput] = useState("");

const handleSmartSubmit = async () => {
  if (!smartInput.trim()) {
    toast.error("Please describe your trip idea.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const response = await fetch("/api/smart-itinerary", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: smartInput,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to generate smart itinerary");
    }

    toast.success("Smart itinerary created!");
    setShowSmartModal(false);

    navigate(`/myitinerary/${data.tripId}`, {
      state: {
        tripName: data.tripName,
        tripStartDate: data.startDateTime.split("T")[0],
        tripId: data.tripId,
      },
    });
  } catch (err: any) {
    toast.error(err.message || "Failed to generate itinerary");
  }
};


useEffect(() => {
  // Initial shuffle
  shuffleVideos();
}, []);

const shuffleVideos = () => {
  const shuffled = [...allVideoIds].sort(() => 0.5 - Math.random()).slice(0, 4);
  setShuffledVideos(shuffled);
};





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

    // 🟢 CREATE the trip and capture the response
    const createdTrip = await createTrip({
      tripName: newTripName,
      startDateTime,
      endDateTime,
      numTravellers: 1,
      thumbnailUrl: "",
    });

    toast.success("Trip created successfully!");
    setShowModal(false);
    await loadTrips();

    // 🟢 Navigate to /explore/:tripId (not using state)
    navigate(`/explore/${createdTrip.tripId}`, {
  state: {
    tripStartDate: createdTrip.startDateTime.split("T")[0], // 'YYYY-MM-DD'
    tripName: createdTrip.tripName,
    tripId: createdTrip.tripId,
  },
});


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
      .then((data) => {
        const newProfile = {
          username: data.username,
          email: data.email,
          password: "",
          oldPassword: ""
        };
        setProfile(newProfile);
        setOriginalProfile({ username: data.username, email: data.email });
      })
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
    const updates: any = {};

    if (profile.username !== originalProfile.username) {
      updates.username = profile.username;
    }

    if (profile.email !== originalProfile.email) {
      updates.email = profile.email;
    }

    const isProfileChanged = Object.keys(updates).length > 0;
    const isPasswordChange = profile.oldPassword && profile.password;

    if (!isProfileChanged && !isPasswordChange) {
      toast("No changes to update");
      return;
    }

    if (isProfileChanged) {
      await updateProfile(updates);
    }

    if (isPasswordChange) {
      await changePassword(profile.oldPassword, profile.password);
    }

    toast.success("Profile updated successfully!");
    setShowProfile(false);
  } catch (err: any) {
    console.error("Profile update error:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Failed to update profile");
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
   <div className="min-h-screen overflow-y-auto hide-scrollbar bg-white text-gray-900 font-sans container mx-auto px-4 md:px-0">



      <Toaster position="top-center" />

      {/* Profile Section */}

{showProfile && (
 <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-gradient-to-b from-blue-50 to-white shadow-2xl z-50 overflow-hidden animate-slideIn">

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
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-white-300 shadow"
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
  <label className="block text-sm font-medium mb-1 text-gray-700">Old Password</label>
  <input
    type="password"
    value={profile.oldPassword}
    onChange={(e) => setProfile({ ...profile, oldPassword: e.target.value })}
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
             className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-white-300 shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}


      <header className="flex justify-between items-center mb-8 pt-6">
  <div className="flex items-center gap-3">
    <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-8" />
    <h1 className="text-2xl font-bold text-[#03253D]">SmartTrip NYC</h1>
  </div>
  <div className="space-x-4">
    <button onClick={() => setShowProfile(true)} className="text-gray-600 hover:text-gray-800">
      Profile
    </button>
    <button onClick={handleLogout} disabled={loggingOut} className="text-gray-600 hover:text-red-600">
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  </div>
</header>
      {/* Plan a new trip */}
      <div className="flex justify-end mb-6">

        <button
          onClick={() => setShowModal(true)}
        
        >
        
        </button>
      </div>
      {showSmartModal && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Smart Itinerary Generator</h2>
      <input
        value={smartInput}
        onChange={(e) => setSmartInput(e.target.value)}
        placeholder="e.g., Chill day in Times Square"
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowSmartModal(false)} className="text-gray-500">
          Cancel
        </button>
        <button
          onClick={handleSmartSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate
        </button>
      </div>
    </div>
  </div>
)}


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

   <h2 className="text-lg font-bold mb-4">My Trips</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">

  {myTrips.map((trip) => {
    const tripDate = new Date(trip.startDateTime);
    const today = new Date();
    tripDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));


    return (
      <div
        key={trip.tripId}
     onClick={() => {
  navigate(`/explore/${trip.tripId}`, {
    state: {
      tripStartDate: trip.startDateTime.split("T")[0], // pass start date 'YYYY-MM-DD'
      tripName: trip.tripName,
      tripId: trip.tripId,
    },
  });
}}



        className="cursor-pointer bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-xl duration-300 relative"
        style={{
          backgroundImage: "url('/assets/pattern.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          backgroundSize: "40%",
        }}
      >
        <div className="p-4 space-y-2">
          <h3 className="text-xl font-semibold text-[#03253D]">{trip.tripName}</h3>
          <div className="flex flex-col text-sm text-gray-600">
  <span className="leading-tight">
    {new Date(trip.startDateTime).toLocaleDateString()} –{" "}
    {new Date(trip.endDateTime).toLocaleDateString()}
  </span>
  {daysLeft > 0 && (
    <span className="text-xs font-semibold text-gray-800 mt-0.5">
      {daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}
    </span>
  )}
</div>

          
          <div className="pt-1">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setConfirmDeleteId(trip.tripId);
    }}
    className="text-xs text-red-500 hover:text-red-700"
  >
    Delete
  </button>
</div>

        </div>
      </div>
    );
  })}

 

{/* ➕ Buttons at the bottom of the trip grid */}
{/* Trip Card for + Plan a New Trip */}
<div
  className="cursor-pointer bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-xl duration-300 flex flex-col items-center justify-center gap-3 py-6"
  onClick={() => setShowModal(true)} // default action for full card
>
  <button
    onClick={(e) => {
      e.stopPropagation(); // prevent card click
      setShowModal(true);
    }}
    className="bg-[#03253D] text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:bg-[#021a2a] transition"
  >
    + Plan a New Trip
  </button>
  <button
    onClick={(e) => {
      e.stopPropagation(); // prevent card click
      setShowSmartModal(true);
    }}
    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:opacity-90 transition"
  >
    ✨ Create Smart Itinerary
  </button>
</div>
</div>

{/* 🔥 TikTok Tourist Picks */}
<div className="mt-12">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-[#03253D]">📍 Must-See Manhattan Moments</h2>
    <button
      onClick={shuffleVideos}
      className="bg-[#03253D] text-white px-6 py-2 rounded shadow hover:bg-[#021a2a] transition"
    >
      Refresh Videos
    </button>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {shuffledVideos.map((id, index) => (
      <div
        key={index}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
      >
        <div className="overflow-hidden rounded-xl">
  <iframe
    src={`https://www.tiktok.com/embed/${id}`}
    allow="autoplay; encrypted-media"
    allowFullScreen
    title={`TikTok Video ${index + 1}`}
    className="w-full h-[500px] border-0"
    scrolling="no"
  />
</div>

        <div className="p-3 text-sm text-center text-gray-700">
          Featured Spot #{index + 1}
        </div>
      </div>
    ))}
  </div>
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
