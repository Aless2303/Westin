import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/westin');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const dropIndex = async () => {
  try {
    const conn = await connectDB();
    
    // Drop the participants_1 index from conversations collection
    if (conn.connection.db) {
      await conn.connection.db.collection('conversations').dropIndex('participants_1');
      console.log('Successfully dropped index: participants_1');
    } else {
      console.error('Database connection is undefined');
    }
  } catch (error: any) {
    console.error(`Error dropping index: ${error.message}`);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Execute the function
dropIndex(); 