import { io } from 'socket.io-client';
const socket = io('https://collaborative-whiteboard-production-0ace.up.railway.app', {
  transports: ['websocket'],
});
export default socket;
