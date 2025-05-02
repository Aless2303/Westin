// backend/src/data/checkMapImages.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkMapImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/westin');
    console.log("Connected to MongoDB");
    
    // Check if connection is established
    if (!mongoose.connection.db) {
      console.log("Database connection not established");
      return;
    }
    
    // Check available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Available collections:");
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Try to access the collection directly
    if (mongoose.connection.db) {
      const mapImagesCollection = mongoose.connection.db.collection('mapImages');
      const count = await mapImagesCollection.countDocuments();
      console.log(`Found ${count} documents in the 'mapimages' collection`);
      
      if (count > 0) {
        const sample = await mapImagesCollection.findOne();
        console.log("Sample document keys:", Object.keys(sample || {}));
        console.log("Sample document type:", sample?.type);
        console.log("Sample document has image:", sample?.image ? 'Yes' : 'No');
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error checking map images:", error);
  }
}

checkMapImages();