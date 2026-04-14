import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000' || import.meta.env.VITE_SOCKET_URL;
console.log(SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};
