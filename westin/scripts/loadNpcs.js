// scripts/loadNpcs.js
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadNpcs() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const npcsCollection = database.collection("npcs");
    
    // Clear existing NPCs if needed
    await npcsCollection.deleteMany({});
    console.log("Cleared existing NPCs");
    
    // Fix the path - remove the extra 'westin' directory
    const npcDirectory = path.join(__dirname, '..', 'public', 'npc');
    
    // NPC data with descriptions
    const npcData = [
      {
        filename: 'Bed.png',
        name: 'Bed Master',
        type: 'rest',
        description: 'Permite jucătorilor să se odihnească și să își refacă rapid energia.',
        interaction: 'sleep'
      },
      {
        filename: 'Depozit.png',
        name: 'Depozitar',
        type: 'storage',
        description: 'Păstrează în siguranță obiectele valoroase ale jucătorilor.',
        interaction: 'storage'
      },
      {
        filename: 'GeneralMarket.png',
        name: 'Negustor',
        type: 'merchant',
        description: 'Vinde diverse obiecte și cumpără resurse de la jucători.',
        interaction: 'trade'
      },
      {
        filename: 'town_icon.png',
        name: 'Ghid Oraș',
        type: 'guide',
        description: 'Oferă informații despre locațiile importante din oraș.',
        interaction: 'info'
      }
    ];
    
    for (const npc of npcData) {
      const filePath = path.join(npcDirectory, npc.filename);
      
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath);
        
        const npcDocument = {
          name: npc.name,
          type: npc.type,
          description: npc.description,
          interaction: npc.interaction,
          image: new Binary(imageBuffer)
        };
        
        await npcsCollection.insertOne(npcDocument);
        console.log(`Added NPC: ${npc.name}`);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }
    
    console.log("All NPCs added successfully");
  } finally {
    await client.close();
  }
}

loadNpcs().catch(console.error);