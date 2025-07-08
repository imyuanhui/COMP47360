// src/pages/LandingPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import toast from "react-hot-toast";
import {
  signup as apiSignup,
  login as apiLogin,
  setAuthToken,
} from "../services/api";
// Utility function to validate email format
const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

 const handleLogin = async () => {
  try {
    const { accessToken } = await apiLogin(loginIdentifier, loginPassword);
    localStorage.setItem("token", accessToken);
    setAuthToken(accessToken);
    toast.success("Logged in!");
    setShowLogin(false);
    navigate("/dashboard");
  } catch (err: any) {
    const error = err.response?.data?.error?.toLowerCase() || "";

    if (error.includes("not found")) {
      toast.error("No account found. Try signing up.");
    } else if (error.includes("wrong password")) {
      toast.error("Incorrect password. Please try again.");
    } else if (error.includes("invalid credentials")) {
      toast.error("Invalid email or password.");
    } else {
      toast.error("Login failed");
    }

    console.error("Login error:", error);
  }
};


 const handleSignup = async () => {
  if (!signupUsername || !signupEmail || !signupPassword) {
    toast.error("Please fill in all fields.");
    return;
  }

  if (!isValidEmail(signupEmail)) {
    toast.error("Please enter a valid email address.");
    return;
  }

  try {
    await apiSignup(signupUsername, signupEmail, signupPassword);
    toast.success("Account created! Please log in.");
    setShowSignup(false);
    setShowLogin(true);
  } catch (err: any) {
    const msg = err.response?.data?.error || "Signup failed";
    console.error("Signup error:", msg);

    if (msg.toLowerCase().includes("email")) {
      toast.error("Email already in use. Try logging in instead.");
    } else if (msg.toLowerCase().includes("username")) {
      toast.error("Username already taken. Try a different one.");
    } else {
      toast.error(msg);
    }
  }
};




  const isModalOpen = showLogin || showSignup;

  return (
    <div className="relative">
      {/* Main content */}
      <div
        className={`min-h-screen bg-white font-sans text-gray-900 transition-filter ${
          isModalOpen ? "filter blur-sm" : ""
        }`}
      >
        {/* Header */}
        <header
          className="container mx-auto flex justify-between items-center py-6 px-4 md:px-0"
          data-aos="fade-down"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">SmartTrip NYC</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => setShowLogin(true)}
              className="hover:text-blue-600 transition"
            >
              Log In
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="bg-[#03253D] text-white px-4 py-1 rounded-full hover:bg-[#021b2b] transition"
            >
              Sign Up
            </button>
          </div>
        </header>

        {/* Hero */}
        <section
          className="container mx-auto px-4 md:px-0 text-center py-20"
          data-aos="zoom-in"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Stress-free holiday planning for NYC
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-6">
            Get personally tailored daily travel plans
          </p>
          <button
            onClick={() => setShowSignup(true)}
            className="bg-[#03253D] text-white px-8 py-3 rounded-full text-sm md:text-base shadow hover:bg-[#021b2b] transition"
          >
            Start Planning
          </button>
        </section>

        {/* Tours */}
        <section
          className="container mx-auto px-4 md:px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-12"
          data-aos="fade-up"
        >
          {[
            { title: "Central Park Tour", date: "dd.mm.yyyy", places: 3 },
            { title: "Downtown Tour", date: "dd.mm.yyyy", places: 3 },
            { title: "Uptown Tour", date: "dd.mm.yyyy", places: 3 },
            { title: "Hidden Gems Tour", date: "dd.mm.yyyy", places: 3 },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="bg-gray-200 h-40 rounded mb-4" />
              <h3 className="text-center font-semibold mb-1">{t.title}</h3>
              <p className="text-center text-sm text-gray-500">
                {t.date} | {t.places} places
              </p>
            </div>
          ))}
        </section>

        {/* Mobile/Web Demo */}
        <section
          className="container mx-auto px-4 md:px-0 text-center py-12"
          data-aos="zoom-in"
        >
          <h2 className="text-2xl font-semibold mb-6">
            Available on Web or Mobile
          </h2>
          <div className="flex justify-center gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-200 w-40 h-56 rounded shadow hover:shadow-lg transition"
              >
                <div className="h-full flex items-center justify-center text-gray-500">
                  Mobile Page {i}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 py-6">
          <div className="container mx-auto px-4 md:px-0 flex flex-col md:flex-row justify-between items-center text-gray-600">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="hover:text-gray-900 transition">
                Sign Up
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                Contact Us
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                FAQs
              </a>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} SmartTrip NYC
            </p>
          </div>
        </footer>
      </div>

      {/* Log In Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg animate-fadeIn relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-4 text-xl text-gray-500 hover:text-gray-800 transition"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Log In</h2>
            <input
              type="text"
              placeholder="Email or Username"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded"
            />
            <button
              onClick={handleLogin}
              className="bg-[#03253D] text-white w-full py-2 rounded mb-3 hover:bg-[#021b2b] transition"
            >
              Continue
            </button>
            <button className="w-full border border-gray-300 py-2 rounded text-sm flex items-center justify-center gap-2 mb-4">
              <img
                src="/assets/google-icon.png"
                className="w-5 h-5"
                alt="Google"
              />
              Continue with Google
            </button>
            <p className="text-sm text-center">
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

      {/* Sign Up Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg animate-fadeIn relative">
            <button
              onClick={() => setShowSignup(false)}
              className="absolute top-3 right-4 text-xl text-gray-500 hover:text-gray-800 transition"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>
            <input
              type="text"
              placeholder="Username"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
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
              className="bg-[#03253D] text-white w-full py-2 rounded mb-3 hover:bg-[#021b2b] transition"
            >
              Create Account
            </button>
            <button className="w-full border border-gray-300 py-2 rounded text-sm flex items-center justify-center gap-2 mb-4">
              <img
                src="/assets/google-icon.png"
                className="w-5 h-5"
                alt="Google"
              />
              Sign up with Google
            </button>
            <p className="text-sm text-center">
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
