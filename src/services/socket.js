import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://markettred-backend.onrender.com';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};
