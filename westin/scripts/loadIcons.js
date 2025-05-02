// scripts/loadIcons.js
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadIcons() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const iconsCollection = database.collection("icons");
    
    // Clear existing icons if needed
    await iconsCollection.deleteMany({});
    console.log("Cleared existing icons");
    
    // Fix the path - remove the extra 'westin' directory
    const iconsDirectory = path.join(__dirname, '..', 'public', 'Icons');
    const iconFiles = fs.readdirSync(iconsDirectory);
    
    // Icon descriptions and categories
    const iconData = {
      'duels.png': {
        name: 'Duels Icon',
        category: 'interface',
        description: 'Pictogramă pentru secțiunea de dueluri din interfața jocului.',
        usage: 'bottom_panel'
      },
      'inventory.png': {
        name: 'Inventory Icon',
        category: 'interface',
        description: 'Pictogramă pentru accesarea inventarului jucătorului.',
        usage: 'bottom_panel'
      },
      'jobs.png': {
        name: 'Jobs Icon',
        category: 'interface',
        description: 'Pictogramă pentru secțiunea de munci și misiuni din joc.',
        usage: 'bottom_panel'
      },
      'telegrame.png': {
        name: 'Messages Icon',
        category: 'interface',
        description: 'Pictogramă pentru sistemul de mesaje și notificări din joc.',
        usage: 'bottom_panel'
      }
    };
    
    for (const file of iconFiles) {
      const filePath = path.join(iconsDirectory, file);
      
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath);
        
        const iconInfo = iconData[file] || {
          name: `Icon ${path.basename(file, path.extname(file))}`,
          category: 'misc',
          description: 'Pictogramă pentru interfața jocului.',
          usage: 'interface'
        };
        
        const iconDocument = {
          name: iconInfo.name,
          filename: file,
          category: iconInfo.category,
          description: iconInfo.description,
          usage: iconInfo.usage,
          image: new Binary(imageBuffer)
        };
        
        await iconsCollection.insertOne(iconDocument);
        console.log(`Added icon: ${file}`);
      }
    }
    
    console.log("All icons added successfully");
  } finally {
    await client.close();
  }
}

loadIcons().catch(console.error);