import axios from "axios";
import type { Place, ItineraryItem, Preferences } from "../types";

// === Axios Configuration ===
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// === Token Management ===
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`; //api, not global authtoken
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// === Auth Interfaces ===
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

// === Auth Endpoints ===
export function signup(username: string, email: string, password: string) {
  return api.post("/signup", { username, email, password }).then((r) => r.data);
}

export function login(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  return api.post("/login", { identifier, password }).then((r) => {
    localStorage.setItem("accessToken", r.data.accessToken);
    localStorage.setItem("refreshToken", r.data.refreshToken);
    setAuthToken(r.data.accessToken);
    return r.data;
  });
}

export async function logout() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Token not found");

  setAuthToken(token);

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  clearAuthToken();
}

export function refreshToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  return api.post("/token/refresh", { refreshToken }).then((r) => r.data);
}

export function oauthLogin(
  provider: "google" | "facebook",
  accessToken: string
): Promise<LoginResponse> {
  return api.post(`/oauth/${provider}`, { accessToken }).then((r) => r.data);
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return api.post("/forgot-password", { email }).then((r) => r.data);
}

export function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  return api
    .post("/reset-password", { token, newPassword })
    .then((r) => r.data);
}

// === User Profile Endpoints ===
export interface Profile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
}

export function fetchProfile(): Promise<Profile> {
  return api.get("/profile").then((r) => r.data);
}

export function updateProfile(
  profileUpdates: Partial<Profile>
): Promise<Profile> {
  return api.patch("/profile", profileUpdates).then((r) => r.data);
}

export function deleteProfile(): Promise<void> {
  return api.delete("/profile").then(() => {});
}

export function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return api
    .put("/profile/change-password", {
      oldPassword,
      newPassword,
    })
    .then((r) => r.data);
}

// === Trips ===
export interface Trip {
  tripId: string;
  tripName: string;
  startDateTime: string;
  endDateTime: string;
  numTravellers: number;
  thumbnailUrl?: string;
}

export interface Visit {
  placeId: number;
  visitTime: string;
}

export interface TripDetails {
  basicInfo: Trip;
  destinations: {
    tripId: string;
    destinationId: number;
    destinationName: string;
    visitTime: string;
  }[];
}

export function fetchMyTrips(params = { page: 1 }): Promise<{ Trips: Trip[] }> {
  return api.get("/trips", { params }).then((r) => r.data);
}

export function createTrip(tripData: {
  tripName?: string;
  startDateTime: string;
  endDateTime: string;
  numTravellers: number;
  thumbnailUrl?: string;
}): Promise<Trip> {
  return api.post("/trips", tripData).then((r) => r.data);
}

export function fetchTripDetails(tripId: string): Promise<TripDetails> {
  return api.get(`/trips/${tripId}`).then((r) => r.data);
}

export function updateTrip(
  tripId: string,
  updates: {
    tripName?: string;
    startDateTime?: string;
    endDateTime?: string;
    numTravellers?: number;
    thumbnailUrl?: string;
  }
): Promise<Trip> {
  return api.put(`/trips/${tripId}`, updates).then((r) => r.data);
}

export function removeItinerary(id: string): Promise<void> {
  return deleteTrip(id);
}

export const deleteTrip = async (tripId: string) => {
  const res = await api.delete(`/trips/${tripId}`);
  return res.data;
};

export function addOrUpdateVisit(tripId: string, visit: Visit): Promise<any> {
  return api.post(`/trips/${tripId}/destinations`, visit).then((r) => r.data);
}

export function updateVisit(tripId: string, visit: Visit): Promise<any> {
  return api.put(`/trips/${tripId}/visits`, visit).then((r) => r.data);
}

export function deleteVisit(tripId: string, placeId: number): Promise<void> {
  return api
    .request({
      method: "DELETE",
      url: `/trips/${tripId}/visits`,
      data: { tripId, placeId },
    })
    .then(() => {});
}

// ------------------------
// Destinations (Visits)
// ------------------------

/**
 * Add a new destination (visit) to a trip.
 */
export const addDestination = (
  tripId: string,
  destinationData: {
    destinationName: string;
    lat: number;
    lon: number;
    visitTime: string;
  }
) => {
  return api.post(`/trips/${tripId}/destinations`, destinationData);
};

/**
 * Update an existing destination (visit) of a trip.
 */
export const updateDestination = (
  tripId: string,
  destinationData: {
    destinationId: number;
    visitTime: string;
  }
) => {
  return api.put(`/trips/${tripId}/destinations`, destinationData);
};

/**
 * Delete a destination (visit) from a trip.
 */
export const deleteDestination = (tripId: string, destinationId: number) => {
  return api.delete(`/trips/${tripId}/destinations`, {
    params: { destinationId },
  });
};

// === Preferences  ===
export function fetchPreferences(): Promise<Preferences> {
  return api.get("/preferences").then((r) => r.data);
}

export function updatePreferences(prefs: Preferences): Promise<Preferences> {
  return api.post("/preferences", prefs).then((r) => r.data);
}
// === Saved Places ===

/** Get saved places for a trip */
export function fetchSavedPlaces(tripId: string): Promise<Place[]> {
  return api.get(`/trips/${tripId}/saved-places`).then((r) => r.data);
}

/** Add a place to the saved list for a trip */
export function addSavedPlace(tripId: string, place: Place): Promise<Place> {
  return api.post(`/trips/${tripId}/saved-places`, place).then((r) => r.data);
}

/** Remove a saved place from a trip */
export function removeSavedPlace(
  tripId: string,
  placeId: string
): Promise<void> {
  return api.delete(`/trips/${tripId}/saved-places/${placeId}`).then(() => {});
}

// === Auto Refresh Token on JWT Expiry ===
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isJwtExpired =
      error.response?.status === 500 &&
      error.response?.data?.message?.includes("JWT expired");

    if (isJwtExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) throw new Error("No refresh token found");

        const res = await api.post("/token/refresh", {
          refreshToken: storedRefreshToken,
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        setAuthToken(newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Auto refresh failed:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
