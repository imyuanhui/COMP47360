// src/pages/LandingPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import toast from "react-hot-toast";
import { login as apiLogin, signup as apiSignup, setAuthToken } from "../api";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleLogin = async () => {
    try {
      const { token } = await apiLogin(loginEmail, loginPassword);
      setAuthToken(token);
      toast.success("Logged in!");
      setShowLogin(false);
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      const { token } = await apiSignup(signupName, signupEmail, signupPassword);
      setAuthToken(token);
      toast.success("Account created!");
      setShowSignup(false);
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Signup failed");
    }
  };

  const isModalOpen = showLogin || showSignup;

  return (
    <div className="relative">
      <div
        className={`min-h-screen bg-white px-24 py-6 font-sans text-gray-900 transition-all duration-300 ${
          isModalOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3" data-aos="fade-right">
            <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full" />
            <h1 className="text-lg font-bold">SmartTrip NYC</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-700" data-aos="fade-left">
            <button onClick={() => setShowLogin(true)} className="hover:underline transition-all">
              Log In
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="bg-[#03253D] text-white px-4 py-1 rounded-full hover:bg-[#021b2b] transition-all"
            >
              Sign Up
            </button>
          </div>
        </header>

        <div className="text-center mb-10" data-aos="zoom-in">
          <h2 className="text-2xl font-bold mb-2">Stress-free holiday planning for NYC</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sign up now to get personally tailored daily travel plans
          </p>
          <button className="bg-[#03253D] text-white px-6 py-2 rounded-full text-sm shadow hover:bg-[#021b2b] transition-all">
            Start Planning
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-8 mb-16" data-aos="zoom-in-up">
          {[
            { title: "Central Park Tour", date: "dd.mm.yyyy", places: 3 },
            { title: "Downtown Tour", date: "dd.mm.yyyy", places: 3 },
            { title: "Uptown Tour", date: "dd.mm.yyyy", places: 3 },
            { title: "Hidden Gems Tour", date: "dd.mm.yyyy", places: 3 },
          ].map((trip, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-4 w-full max-w-xs mx-auto hover:scale-105 transition transform duration-300 ease-in-out"
            >
              <div className="bg-gray-300 w-full h-60 rounded mb-4" />
              <h3 className="text-center font-semibold text-lg">{trip.title}</h3>
              <p className="text-center text-sm text-gray-500">
                {trip.date} | {trip.places} places
              </p>
            </div>
          ))}
        </div>

        <h3 className="text-center text-lg font-semibold mb-4" data-aos="fade-up">
          Available on Web or Mobile
        </h3>
        <div className="bg-gray-200 rounded-lg p-6 flex justify-center gap-6 mb-12" data-aos="zoom-in-up">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-gray-400 w-[140px] h-[250px] rounded flex items-center justify-center text-[10px] text-gray-700 shadow hover:scale-105 transition-all"
            >
              MOBILE PAGE {i + 1}
            </div>
          ))}
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg relative animate-slide-in-up">
            <button onClick={() => setShowLogin(false)} className="absolute top-2 right-3 text-xl">
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Log In</h2>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              className="w-full mb-4 px-4 py-2 border rounded"
            />
            <button
              onClick={handleLogin}
              className="bg-[#03253D] text-white w-full py-2 rounded hover:bg-[#021b2b]"
            >
              Continue
            </button>
            <button className="w-full mt-4 border border-gray-300 py-2 rounded text-sm flex items-center justify-center gap-2">
              <img src="/assets/google-icon.png" className="w-4 h-4" alt="Google" />
              Continue with Google
            </button>
            <p className="text-sm mt-4 text-center">
              Don’t have an account?{" "}
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                className="text-[#03253D] hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg relative animate-slide-in-up">
            <button onClick={() => setShowSignup(false)} className="absolute top-2 right-3 text-xl">
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded"
            />
            <button
              onClick={handleSignup}
              className="bg-[#03253D] text-white w-full py-2 rounded hover:bg-[#021b2b]"
            >
              Create Account
            </button>
            <button className="w-full mt-4 border border-gray-300 py-2 rounded text-sm flex items-center justify-center gap-2">
              <img src="/assets/google-icon.png" className="w-4 h-4" alt="Google" />
              Sign up with Google
            </button>
            <p className="text-sm mt-4 text-center">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
                className="text-[#03253D] hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
