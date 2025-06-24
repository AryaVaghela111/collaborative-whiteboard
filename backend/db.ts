// backend/db.ts
import mongoose from 'mongoose'

export const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: 'whiteboard',
    })
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
  }
}
