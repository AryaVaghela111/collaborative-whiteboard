import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { createServer } from 'http';

const fastify = Fastify();

// Enable CORS for all origins
await fastify.register(fastifyCors, {
  origin: '*',
});

// Create raw HTTP server from Fastify's instance
const httpServer = createServer(fastify.server);

// Create Socket.io server with CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('canvas:update', (data) => {
    // Broadcast the update to all other clients except sender
    socket.broadcast.emit('canvas:update', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Fastify HTTP route for health check
fastify.get('/', async () => {
  return { status: 'Socket.io + Fastify server running ✅' };
});

// Start the HTTP server
httpServer.listen(3001, () => {
  console.log('✅ Fastify + Socket.io server running on http://localhost:3001');
});
