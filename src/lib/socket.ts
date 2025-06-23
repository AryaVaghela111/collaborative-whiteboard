import { io } from 'socket.io-client';
const socket = io('http://localhost:3001'); // or deployed URL
export default socket;
