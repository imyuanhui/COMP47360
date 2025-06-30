// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import type { Place } from '../types';

export type PlaceUpdate = Partial<{
  id: string;
  crowdTime: string;
  // you can extend with other real-time fields, e.g. open/closed, live counts, etc.
}>;

let socket: Socket | null = null;

/**
 * Subscribe to server “placeUpdate” events.
 * @param onUpdate callback when an update arrives
 * @returns a function to unsubscribe
 */
export function subscribeUpdates(onUpdate: (upd: PlaceUpdate) => void): () => void {
  if (!socket) {
    // adjust the URL if your server runs on a different origin/port
    socket = io(import.meta.env.VITE_SOCKET_URL || '/');
  }
  socket.on('placeUpdate', onUpdate);
  
  return () => {
    if (socket) {
      socket.off('placeUpdate', onUpdate);
      // optionally disconnect entirely:
      // socket.disconnect();
      // socket = null;
    }
  };
}
