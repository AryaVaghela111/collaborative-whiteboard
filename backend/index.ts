import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import dotenv from 'dotenv'
import { connectToMongo } from './db'
import { roomRoutes } from './routes/room'

dotenv.config({ path: './.env' })

const start = async () => {
  await connectToMongo()

  const fastify = Fastify()

  await fastify.register(fastifyCors, {
    origin: '*',
  })

  await fastify.register(roomRoutes)

  const httpServer = createServer(fastify.server)

  const io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id)

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId)
      console.log(`📌 Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('canvas:update', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:update', data)
    })

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id)
    })
  })

  fastify.get('/', async () => {
     console.log('✅ GET / called');
    return { status: 'Socket.io + Fastify server running ✅' }
  })

  // ✅ Use PORT and host 0.0.0.0 for Railway compatibility
  const port = parseInt(process.env.PORT || '3001')
  const host = '0.0.0.0'

  await httpServer.listen(port, host);
  console.log(`✅ Fastify + Socket.io server running on http://${host}:${port}`);
}

start()
