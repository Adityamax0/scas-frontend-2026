import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket;

/**
 * Initialize and get the Socket.io client instance
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });
    
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from server');
    });
  }
  return socket;
};

/**
 * Join a district-specific room
 */
export const joinDistrictRoom = (district) => {
  const skt = getSocket();
  if (district) {
    console.log(`[SOCKET] Joining district room: ${district}`);
    skt.emit('join_district', district);
  }
};

/**
 * Cleanup socket connection
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
