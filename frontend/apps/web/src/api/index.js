import axios from "axios";

const api = axios.create({
  baseURL: "https://your-api-domain.com/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export async function login(email, password) {
  const resp = await api.post("/auth/login", { email, password });
  return resp.data;
}

export async function signup(name, email, password,number) {
  const resp = await api.post("/auth/signup", { name, email, password, number });
  return resp.data;
}

export async function logout() {
  const resp = await api.post("/auth/logout"); /**Delete the token instead of the api call */
  return resp.data;
}

export async function fetchTrendingTrips() {
  const resp = await api.get("/trips/trending");
  return resp.data;
}

export async function fetchMyTrips() {
  const resp = await api.get("/trips/mine");
  return resp.data;
}

export async function planTrip({ dateRange, categories }) {
  const resp = await api.post("/trips/plan", { dateRange, categories });
  return resp.data;
}

export async function fetchProfile() {
  const resp = await api.get("/users/me");
  return resp.data;
}

export async function updateProfile(updates) {
  const resp = await api.put("/users/me", updates);
  return resp.data;
}

export async function manageSubscription(action, payload) {
  const resp = await api.post(`/users/subscription/${action}`, payload);
  return resp.data;
}

export function setAuthToken(token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}
