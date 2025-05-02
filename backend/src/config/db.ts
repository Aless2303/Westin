import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    // Asigură-te că URI-ul conține numele bazei de date "westin"
    let mongoURI = process.env.MONGODB_URI as string;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Verifică dacă URI-ul include deja numele bazei de date
    if (!mongoURI.includes('/westin')) {
      // Dacă nu conține deja /westin, adaugă-l
      mongoURI = mongoURI.endsWith('/') ? `${mongoURI}westin` : `${mongoURI}/westin`;
    }

    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Make sure MongoDB is running and the connection string is correct');
    process.exit(1);
  }
};

export default connectDB;