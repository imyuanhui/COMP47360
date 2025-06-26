// src/services/api.ts
import axios from 'axios';
import type { Place, ItineraryItem, Preferences } from '../types';

// —————— Places & Itinerary ——————
export async function fetchPlaces(query: string, filters: string[]): Promise<Place[]> {
  const resp = await axios.get<Place[]>('/api/places', {
    params: { q: query, filters: filters.join(',') },
  })
  return resp.data
}
export function fetchItinerary() {
  return axios.get<ItineraryItem[]>('/api/itinerary').then(r => r.data);
}
export function addItinerary(placeId: string, time: string) {
  return axios.post('/api/itinerary/add', { placeId, time });
}
export function removeItinerary(id: string) {
  return axios.delete(`/api/itinerary/${id}`);
}
export function fetchSaved() {
  return axios.get<Place[]>('/api/places/saved').then(r => r.data);
}
export function fetchPreferences() {
  return axios.get<Preferences>('/api/preferences').then(r => r.data);
}
export function updatePreferences(p: Preferences) {
  return axios.post('/api/preferences', p);
}

// —————— Auth ——————
export async function signup(username: string, email: string, password: string) {
  return axios
    .post<{ message: string }>('/api/auth/signup', { username, email, password })
    .then(r => r.data);
}

export async function login(identifier: string, password: string) {
  return axios
    .post<{ accessToken: string }>('/api/auth/login', { identifier, password })
    .then(r => r.data);
}

// Store the token for subsequent calls
export function setAuthToken(token: string) {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}
