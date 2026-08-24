import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance with event listeners & graceful error handling.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dayflow_hrms';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB at ${mongoUri}`);
    console.error(`[Database Error Details] ${error.message}`);
    console.warn('[Database Warning] Running in offline/disconnected database mode. Ensure MongoDB is running for data persistence.');
  }

  // Connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost. Disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Event Error] ${err.message}`);
  });
};

export default connectDB;
