// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api", // adjust if your backend lives elsewhere
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true, // if you use cookies
// });

// // Auth
// export async function signup(username, email, password) {
//   const resp = await api.post("/signup", { username, email, password });
//   return resp.data; // { message, userId }
// }

// export async function login(identifier, password) {
//   const resp = await api.post("/login", { identifier, password });
//   return resp.data; // { accessToken, refreshToken, user }
// }

// export async function logout() {
//   const resp = await api.post("/logout");
//   return resp.data;
// }

// export async function refreshToken(refreshToken) {
//   const resp = await api.post("/token/refresh", { refreshToken });
//   return resp.data; // { accessToken }
// }

// // Trips
// export async function fetchTrendingTrips() {
//   const resp = await api.get("/trips/trending");
//   return resp.data; // [ { id, title, image, ... } ]
// }

// export async function fetchMyTrips() {
//   const resp = await api.get("/trips/mine");
//   return resp.data; // [ { id, title, date, places, ... } ]
// }

// export async function planTrip(dateRange, categories = []) {
//   const resp = await api.post("/trips/plan", { dateRange, categories });
//   return resp.data; // { tripId, itineraryUrl }
// }

// // Profile
// export async function fetchProfile() {
//   const resp = await api.get("/users/me");
//   return resp.data;
// }
// export async function updateProfile(updates) {
//   const resp = await api.put("/users/me", updates);
//   return resp.data;
// }

// // Helpers
// export function setAuthToken(token) {
//   api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
// }
// export function clearAuthToken() {
//   delete api.defaults.headers.common["Authorization"];
// }
