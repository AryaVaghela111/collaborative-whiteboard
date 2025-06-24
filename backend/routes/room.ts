// backend/routes/room.ts
import { FastifyInstance } from 'fastify'
import { Room } from '../models/Room'

export async function roomRoutes(fastify: FastifyInstance) {
  fastify.get('/room/:id', async (req, reply) => {
    const roomId = (req.params as any).id

    let room = await Room.findOne({ roomId })

    if (!room) {
      room = await Room.create({ roomId })
    }

    return room
  })
  fastify.post('/room/:id/save', async (req, reply) => {
    const roomId = (req.params as any).id
    const { canvasData } = req.body as any

    await Room.updateOne({ roomId }, { canvasData }, { upsert: true })

    return { status: 'Canvas saved' }
  })  

}
