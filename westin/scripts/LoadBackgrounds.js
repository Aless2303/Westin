// scripts/loadBackgrounds.js
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadBackgrounds() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const backgroundsCollection = database.collection("backgrounds");
    
    // Clear existing backgrounds if needed
    await backgroundsCollection.deleteMany({});
    console.log("Cleared existing backgrounds");
    
    // Fix the path - remove the extra 'westin' directory
    const backgroundsDirectory = path.join(__dirname, '..', 'public', 'Backgrounds');
    const backgroundFiles = fs.readdirSync(backgroundsDirectory);
    
    // Background descriptions
    const backgroundDescriptions = [
      'Priveliște spectaculoasă a Munților Vestitului Apus, înconjurați de vegetație luxuriantă.',
      'Canyon arid cu pereți stâncoși și vegetație caracteristică Vestului Sălbatic.',
      'Peisaj deșertic cu formațiuni stâncoase impresionante și cactus specifici regiunii.',
      'Peisaj natural cu râu și vegetație abundentă, perfectă pentru călători și aventurieri.'
    ];
    
    let index = 0;
    for (const file of backgroundFiles) {
      const filePath = path.join(backgroundsDirectory, file);
      
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath);
        
        // Extract base filename without extension
        const baseName = path.basename(file, path.extname(file));
        
        const backgroundDocument = {
          name: `Peisaj ${baseName}`,
          filename: file,
          description: backgroundDescriptions[index] || `Peisaj spectaculos din lumea Westin.`,
          image: new Binary(imageBuffer)
        };
        
        await backgroundsCollection.insertOne(backgroundDocument);
        console.log(`Added background: ${file}`);
        
        index++;
      }
    }
    
    console.log("All backgrounds added successfully");
  } finally {
    await client.close();
  }
}

loadBackgrounds().catch(console.error);