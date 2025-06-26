// src/types.ts

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  crowdTime: string;
  visitTime: string;
  rating: number;
  imageUrl: string;
}

export interface ItineraryItem {
  id: string;
  place: Place;
  time: string;
}

export interface Preferences {
  categories: string[];
}
export interface Place {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  crowdTime: string;
  rating: number;
  lat: number;
  lng: number;
  place: string;
  distance: number;
  openNow: string;
  // ADD THIS:
  travel: {
    walk: number;    // minutes walking
    drive: number;   // minutes driving
    transit: number; // minutes public transit
  };
}