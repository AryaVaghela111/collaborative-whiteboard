import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { connectToMongo } from './db';
import { roomRoutes } from './routes/room';

dotenv.config({ path: './.env' });

const start = async () => {
  await connectToMongo();

  const fastify = Fastify();

  await fastify.register(fastifyCors, {
    origin: ['https://collaborative-whiteboard-gamma.vercel.app/'],
    credentials: true,
  });

  await fastify.register(roomRoutes);

  fastify.get('/', async () => {
    console.log('✅ GET / called');
    return { status: 'Socket.io + Fastify server running ✅' };
  });

  const port = parseInt(process.env.PORT || '3001');
  const host = '0.0.0.0';

  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: ['https://collaborative-whiteboard-gamma.vercel.app/'], // or replace with Vercel domain
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('canvas:update', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:update', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });

  // ✅ Use Fastify's native listen()
  await fastify.listen({ port, host });
  console.log(`✅ Server listening at http://${host}:${port}`);
};

start();
