import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { createServer } from 'http';

const fastify = Fastify();
await fastify.register(fastifyCors, {
  origin: '*',
});

const httpServer = createServer(fastify.server);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('canvas:update', (data) => {
    socket.broadcast.emit('canvas:update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

fastify.get('/', async () => {
  return { status: 'Socket.io + Fastify server running ✅' };
});

httpServer.listen(3001, () => {
  console.log('✅ Fastify + Socket.io server running on http://localhost:3001');
});
