import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMongooseConnected = false;

export async function connectDB(): Promise<{ mode: 'mongoose' | 'file-store'; uri?: string }> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]{3})[^:@]*@/, ':***@')}`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if local mongod is not running
      });
      isMongooseConnected = true;
      console.log('✅ [Database] Successfully connected to MongoDB via Mongoose');
      return { mode: 'mongoose', uri: mongoUri };
    } catch (err: any) {
      console.warn(`⚠️ [Database] MongoDB connection failed (${err.message}). Using persistent local document store.`);
      isMongooseConnected = false;
    }
  } else {
    console.log('ℹ️ [Database] No MONGODB_URI provided in environment. Initializing persistent local document store.');
  }

  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return { mode: 'file-store' };
}

export function isUsingMongoose(): boolean {
  return isMongooseConnected;
}
