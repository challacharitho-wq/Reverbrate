import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.error('MONGO_URI is not set in .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

export default connectDB
