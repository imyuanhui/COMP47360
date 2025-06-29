// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface UserPayload {
  id: string;
  username?: string;
  email: string;
  provider?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPayload;
}

export function signup(
  email: string,
  username: string,
  password: string
): Promise<{ message: string; userId: string }> {
  return api.post("/signup", { email, username, password }).then(r => r.data);
}

export function login(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  return api.post("/login", { identifier, password }).then(r => r.data);
}

export function oauthGoogle(
  accessToken: string
): Promise<LoginResponse> {
  return api.post("/oauth/google", { accessToken }).then(r => r.data);
}

export function oauthFacebook(
  accessToken: string
): Promise<LoginResponse> {
  return api.post("/oauth/facebook", { accessToken }).then(r => r.data);
}

export function refreshToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  return api.post("/token/refresh", { refreshToken }).then(r => r.data);
}

export function logout(): Promise<{ message: string }> {
  return api.post("/logout").then(r => r.data);
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return api.post("/forgot-password", { email }).then(r => r.data);
}

export function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  return api.post("/reset-password", { token, newPassword }).then(r => r.data);
}

// ─── USERS & PROFILE ────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  subscriptionStatus: string;
}

export function fetchProfile(): Promise<Profile> {
  return api.get("/users/me").then(r => r.data);
}

export function updateProfile(
  updates: Partial<Pick<Profile, "username" | "phone" | "location">>
): Promise<Profile> {
  return api.put("/users/me", updates).then(r => r.data);
}

export function manageSubscription(
  action: "upgrade" | "downgrade" | "cancel",
  payload?: any
): Promise<{ subscriptionStatus: string }> {
  return api.post(`/users/subscription/${action}`, payload).then(r => r.data);
}

// ─── TRIPS ─────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  title: string;
  image: string;
  rating?: number;
  date?: string;
  places?: number;
}

export function fetchTrendingTrips(): Promise<Trip[]> {
  return api.get("/trips/trending").then(r => r.data);
}

export function fetchMyTrips(): Promise<Trip[]> {
  return api.get("/trips/mine").then(r => r.data);
}

export interface PlanTripArgs {
  dateRange: { startDate: string; endDate: string };
  categories: string[];
}

export function planTrip(
  args: PlanTripArgs
): Promise<{ tripId: string; itineraryUrl?: string }> {
  return api.post("/trips/plan", args).then(r => r.data);
}

// ─── PLACES & ITINERARY ────────────────────────────────────────────────────────

import type { Place, ItineraryItem, Preferences } from "../types";

export function fetchPlaces(
  query: string,
  filters: string[]
): Promise<Place[]> {
  return api
    .get("/places", { params: { q: query, filters: filters.join(",") } })
    .then(r => r.data);
}

export function fetchItinerary(): Promise<ItineraryItem[]> {
  return api.get("/itinerary").then(r => r.data);
}

export function addItinerary(
  placeId: string,
  timeSlot: string
): Promise<void> {
  return api.post("/itinerary/add", { placeId, time: timeSlot }).then(r => r.data);
}

export function removeItinerary(id: string): Promise<void> {
  return api.delete(`/itinerary/${id}`).then(r => r.data);
}

export function fetchSavedPlaces(): Promise<Place[]> {
  return api.get("/places/saved").then(r => r.data);
}

// ─── PREFERENCES ───────────────────────────────────────────────────────────────

export function fetchPreferences(): Promise<Preferences> {
  return api.get("/preferences").then(r => r.data);
}

export function updatePreferences(
  prefs: Preferences
): Promise<Preferences> {
  return api.post("/preferences", prefs).then(r => r.data);
}
