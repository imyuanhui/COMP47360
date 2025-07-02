import axios from "axios";
import type { Place, ItineraryItem, Preferences } from "../types";

// === Axios Configuration ===
const api = axios.create({
  baseURL: "http://localhost:8080/api", //http instead of https
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
export function signup(email: string, username: string, password: string) {
  return api.post("/signup", { email, username, password }).then((r) => r.data);
}

export function login(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  return api.post("/login", { identifier, password }).then((r) => {
    localStorage.setItem("token", r.data.accessToken);
    localStorage.setItem("refreshToken", r.data.refreshToken);
    setAuthToken(r.data.accessToken);
    return r.data;
  });
}

export async function logout(): Promise<{ message: string }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");

  setAuthToken(token);
  const response = await api.post("/logout");

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  clearAuthToken();

  return response.data;
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
  tripId: number;
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
  visits: {
    visitTime: string;
    place: { placeId: number; placeName: string };
  }[];
}

export function fetchMyTrips(params = { page: 1 }): Promise<{ Trips: Trip[] }> {
  return api.get("/trips", { params }).then((r) => r.data);
}

export function fetchItinerary(): Promise<ItineraryItem[]> {
  return fetchMyTrips({ page: 1 }).then((r) => {
    return r.Trips.map((trip) => ({
      id: trip.tripId.toString(),
      place: {
        id: trip.tripId.toString(),
        name: trip.tripName,
        lat: 0,
        lng: 0,
        address: "Address not provided",
        travel: {
          walk: 0,
          drive: 0,
          transit: 0,
        },
      },
      time: trip.startDateTime,
    }));
  });
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

export function fetchTripDetails(tripId: number): Promise<TripDetails> {
  return api.get(`/trips/${tripId}`).then((r) => r.data);
}

export function updateTrip(
  tripId: number,
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

export function addOrUpdateVisit(tripId: number, visit: Visit): Promise<any> {
  return api.post(`/trips/${tripId}/visits`, visit).then((r) => r.data);
}

export function updateVisit(tripId: number, visit: Visit): Promise<any> {
  return api.put(`/trips/${tripId}/visits`, visit).then((r) => r.data);
}

export function deleteVisit(tripId: number, placeId: number): Promise<void> {
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
export const addDestination = (tripId: number, destinationData: {
  tripId: number;
  destinationName: string;
  lat: number;
  lon: number;
  visitTime: string;
}) => {
  return api.post(`/api/trips/${tripId}/destinations`, destinationData);
};

/**
 * Update an existing destination (visit) of a trip.
 */
export const updateDestination = (tripId: number, destinationData: {
  destinationId: number;
  visitTime: string;
}) => {
  return api.put(`/api/trips/${tripId}/destinations`, destinationData);
};

/**
 * Delete a destination (visit) from a trip.
 */
export const deleteDestination = (tripId: number, destinationId: number) => {
  return api.delete(`/api/trips/${tripId}/destinations`, {
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
        localStorage.setItem("token", newAccessToken);
        setAuthToken(newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Auto refresh failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
