// scripts/loadRaces.js
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadRaces() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const racesCollection = database.collection("races");
    
    // Clear existing races if needed
    await racesCollection.deleteMany({});
    console.log("Cleared existing races");
    
    // Fix the path - remove the extra 'westin' directory
    const racesDirectory = path.join(__dirname, '..', 'public', 'Races');
    
    // Race descriptions
    const raceDescriptions = {
      'warrior': 'Războinici puternici și rezistenți, specializați în lupte corp la corp și capabili să suporte lovituri puternice.',
      'ninja': 'Asasini agili și rapizi, specializați în lovituri precise și evitarea atacurilor inamice.',
      'sura': 'Luptători întunecați care folosesc puteri demonice pentru a-și doborî adversarii cu atacuri devastatoare.',
      'shaman': 'Maeștri ai magiei elementale și ai vindecării, capabili să controleze forțele naturii.'
    };
    
    // Process male races
    const maleDirectory = path.join(racesDirectory, 'masculin');
    const maleFiles = fs.readdirSync(maleDirectory);
    
    for (const file of maleFiles) {
      const filePath = path.join(maleDirectory, file);
      const raceName = path.basename(file, '.png').toLowerCase();
      
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath);
        
        const raceDocument = {
          name: raceName.charAt(0).toUpperCase() + raceName.slice(1),
          gender: 'Masculin',
          description: raceDescriptions[raceName] || `Rasa ${raceName} din lumea Westin.`,
          baseStats: generateBaseStats(raceName),
          image: new Binary(imageBuffer)
        };
        
        await racesCollection.insertOne(raceDocument);
        console.log(`Added race: ${raceName} (Masculin)`);
      }
    }
    
    // Process female races
    const femaleDirectory = path.join(racesDirectory, 'feminin');
    const femaleFiles = fs.readdirSync(femaleDirectory);
    
    for (const file of femaleFiles) {
      const filePath = path.join(femaleDirectory, file);
      const raceName = path.basename(file, '.png').toLowerCase();
      
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath);
        
        const raceDocument = {
          name: raceName.charAt(0).toUpperCase() + raceName.slice(1),
          gender: 'Feminin',
          description: raceDescriptions[raceName] || `Rasa ${raceName} din lumea Westin.`,
          baseStats: generateBaseStats(raceName),
          image: new Binary(imageBuffer)
        };
        
        await racesCollection.insertOne(raceDocument);
        console.log(`Added race: ${raceName} (Feminin)`);
      }
    }
    
    console.log("All races added successfully");
  } finally {
    await client.close();
  }
}

// Generate base stats based on race
function generateBaseStats(race) {
  const baseStats = {
    hp: 100,
    attack: 10,
    defense: 10,
    speed: 10,
    magicPower: 10
  };
  
  switch(race) {
    case 'warrior':
      baseStats.hp = 120;
      baseStats.attack = 12;
      baseStats.defense = 15;
      baseStats.speed = 8;
      baseStats.magicPower = 5;
      break;
    case 'ninja':
      baseStats.hp = 90;
      baseStats.attack = 14;
      baseStats.defense = 8;
      baseStats.speed = 16;
      baseStats.magicPower = 7;
      break;
    case 'sura':
      baseStats.hp = 100;
      baseStats.attack = 16;
      baseStats.defense = 7;
      baseStats.speed = 11;
      baseStats.magicPower = 13;
      break;
    case 'shaman':
      baseStats.hp = 85;
      baseStats.attack = 7;
      baseStats.defense = 9;
      baseStats.speed = 10;
      baseStats.magicPower = 18;
      break;
  }
  
  return baseStats;
}

loadRaces().catch(console.error);