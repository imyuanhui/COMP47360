// src/types.ts

export interface TravelTimes {
  walk: number;
  drive: number;
  transit: number;
}
export type BusynessLevel = 'low' | 'med' | 'high' | 'unknown' | 'loading';
export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;

  /* mark the rest optional */
  crowdTime?: string;
  visitTime?: string;
  rating?: number;
  imageUrl?: string;
  travel: TravelTimes
   busynessLevel?: BusynessLevel;
  /* add other fields here … */

}

export interface ItineraryItem {
  id: string;
  place: Place;
  time: string;
}

export interface Preferences {
  categories: string[];
}

export type PlaceResult = google.maps.places.PlaceResult;


