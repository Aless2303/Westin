// scripts/loadMapImages.js
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadMapImages() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const mapImagesCollection = database.collection("mapImages");
    
    // Clear existing map images if needed
    await mapImagesCollection.deleteMany({});
    console.log("Cleared existing map images");
    
    // Define the images to load with appropriate metadata
    const mapImagesData = [
      {
        filename: "westin.jpg",
        type: "login_background",
        description: "Fundal pentru pagina de login a jocului Westin.",
        usage: "login_page"
      },
      {
        filename: "westinmap.jpg",
        type: "game_map",
        description: "Harta completă a lumii Westin utilizată în joc.",
        usage: "game_map_background"
      },
      {
        filename: "westinmapFARANIMIC.jpg",
        type: "game_map_base",
        description: "Versiunea inițială a hărții lumii Westin, fără marcaje.",
        usage: "game_map_base"
      }
    ];
    
    // Path to the images directory
    const imagesDirectory = path.join(__dirname, '..', 'public', 'assets', 'images');
    
    for (const imageData of mapImagesData) {
      const imagePath = path.join(imagesDirectory, imageData.filename);
      
      if (fs.existsSync(imagePath)) {
        // Read the image file
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Create document with image
        const imageDocument = {
          name: imageData.filename.replace('.jpg', ''),
          filename: imageData.filename,
          type: imageData.type,
          description: imageData.description,
          usage: imageData.usage,
          dimensions: await getImageDimensions(imagePath),
          fileSize: fs.statSync(imagePath).size,
          mimeType: "image/jpeg",
          image: new Binary(imageBuffer),
          uploadedAt: new Date()
        };
        
        // Add to database
        await mapImagesCollection.insertOne(imageDocument);
        console.log(`Added map image: ${imageData.filename}`);
      } else {
        console.log(`Image not found: ${imagePath}`);
      }
    }
    
    console.log("All map images added successfully");
  } catch (error) {
    console.error("Error loading map images:", error);
  } finally {
    await client.close();
  }
}

// Helper function to get image dimensions
// Since Node.js doesn't have built-in image processing, this is a placeholder
// In a real implementation, you could use a library like 'image-size'
async function getImageDimensions(imagePath) {
  // This is a placeholder - for real implementation install the 'image-size' package
  // and use: const dimensions = require('image-size')(imagePath);
  
  // For now, return placeholder dimensions based on file names
  const filename = path.basename(imagePath);
  if (filename === "westin.jpg") {
    return { width: 1920, height: 1080 };
  } else if (filename === "westinmap.jpg") {
    return { width: 2048, height: 2048 };
  } else if (filename === "westinmapFARANIMIC.jpg") {
    return { width: 2048, height: 2048 };
  }
  
  // Default dimensions if unknown
  return { width: 0, height: 0 };
}

loadMapImages().catch(console.error);