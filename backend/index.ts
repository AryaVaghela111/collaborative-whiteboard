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

    socket.on('canvas:update', (data) => {
      socket.broadcast.emit('canvas:update', data)
    })

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id)
    })
  })

  fastify.get('/', async () => {
    return { status: 'Socket.io + Fastify server running ✅' }
  })

  httpServer.listen(3001, () => {
    console.log('✅ Fastify + Socket.io server running on http://localhost:3001')
  })
}

start()
