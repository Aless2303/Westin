const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadItems() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const itemsCollection = database.collection("items");
    
    // Clear existing items if needed
    await itemsCollection.deleteMany({});
    console.log("Cleared existing items");
    
    // Define item tiers and their levels
    const tiers = [
      { name: 'Incepator', level: 1 },
      { name: 'Otel', level: 11 },
      { name: 'Posedat', level: 25 },
      { name: 'Cianit', level: 35 },
      { name: 'Avansata Rubin', level: 49 }
    ];
    
    // Race-specific items
    const raceSpecificCategories = ['Weapons', 'Armours', 'Coif'];
    const races = ['Ninja', 'Warrior', 'Sura', 'Shaman'];
    
    // Universal items
    const universalCategories = ['Bratara', 'Cercei', 'Colier', 'Papuci', 'Scut'];
    
    // Item type mappings
    const typeMap = {
      'Weapons': 'weapon',
      'Armours': 'armor',
      'Coif': 'helmet',
      'Scut': 'shield',
      'Bratara': 'bracelet',
      'Cercei': 'earrings',
      'Colier': 'necklace',
      'Papuci': 'boots'
    };
    
    // Process race-specific items
    for (const category of raceSpecificCategories) {
      for (const race of races) {
        for (const tier of tiers) {
          const fileName = `${race} ${category} ${tier.name} - LvL ${tier.level}.png`;
          const filePath = path.join(__dirname, '..', 'public', 'Items', category, race, fileName);
          
          if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            
            // Calculate stats based on item type and level
            const stats = calculateStats(typeMap[category], tier.level);
            
            const item = {
              name: `${race} ${category.slice(0, -1)} ${tier.name}`,
              type: typeMap[category],
              category: category,
              raceRestriction: race,
              requiredLevel: tier.level,
              tier: tier.name,
              stats: stats,
              description: generateDescription(race, category, tier.name),
              image: new Binary(imageBuffer),
              price: calculatePrice(typeMap[category], tier.level),
              tradeable: true,
              sellable: true,
              dropRate: calculateDropRate(tier.level)
            };
            
            await itemsCollection.insertOne(item);
            console.log(`Added ${fileName}`);
          } else {
            console.log(`File not found: ${filePath}`);
          }
        }
      }
    }
    
    // Process universal items
    for (const category of universalCategories) {
      for (const tier of tiers) {
        const fileName = `${category} ${tier.name} - LvL ${tier.level}.png`;
        const filePath = path.join(__dirname, '..', 'public', 'Items', category, fileName);
        
        if (fs.existsSync(filePath)) {
          const imageBuffer = fs.readFileSync(filePath);
          
          // Calculate stats based on item type and level
          const stats = calculateStats(typeMap[category], tier.level);
          
          const item = {
            name: `${category} ${tier.name}`,
            type: typeMap[category],
            category: category,
            raceRestriction: null, // Universal item
            requiredLevel: tier.level,
            tier: tier.name,
            stats: stats,
            description: generateDescription(null, category, tier.name),
            image: new Binary(imageBuffer),
            price: calculatePrice(typeMap[category], tier.level),
            tradeable: true,
            sellable: true,
            dropRate: calculateDropRate(tier.level)
          };
          
          await itemsCollection.insertOne(item);
          console.log(`Added ${fileName}`);
        } else {
          console.log(`File not found: ${filePath}`);
        }
      }
    }
    
    console.log("All items added successfully");
  } finally {
    await client.close();
  }
}

// Calculate stats based on item type and level
function calculateStats(type, level) {
  // Base values
  const baseValue = Math.floor(level * 1.5);
  const stats = {};
  
  // Item-specific stats
  switch (type) {
    case 'weapon':
      stats.attack = baseValue * 2;
      // Add some variety based on level tiers
      if (level >= 35) stats.criticalHit = Math.floor(level / 7);
      if (level >= 25) stats.attackSpeed = Math.floor(level / 10);
      break;
    case 'armor':
    case 'helmet':
    case 'shield':
      stats.defense = Math.floor(baseValue * 1.5);
      if (level >= 35) stats.magicResist = Math.floor(level / 8);
      break;
    case 'bracelet':
      stats.defense = Math.floor(baseValue * 0.5);
      stats.hp = level * 5;
      stats.attackSpeed = Math.floor(level / 10);
      break;
    case 'earrings':
      stats.defense = Math.floor(baseValue * 0.3);
      stats.hp = level * 4;
      stats.magicResist = Math.floor(level / 7);
      break;
    case 'necklace':
      stats.defense = Math.floor(baseValue * 0.4);
      stats.hp = level * 6;
      break;
    case 'boots':
      stats.defense = Math.floor(baseValue * 0.6);
      stats.hp = level * 3;
      stats.movementSpeed = Math.floor(level / 12);
      stats.evasion = Math.floor(level / 15);
      break;
  }
  
  return stats;
}

// Generate item description
function generateDescription(race, category, tier) {
  let description = '';
  
  if (race) {
    description = `${tier} ${category.slice(0, -1).toLowerCase()} special pentru rasa ${race}.`;
  } else {
    description = `${tier} ${category.toLowerCase()} folosit de toate rasele.`;
  }
  
  // Add tier-specific text
  switch (tier) {
    case 'Incepator':
      description += ' Potrivit pentru lupte simple împotriva monștrilor de nivel scăzut.';
      break;
    case 'Otel':
      description += ' Confecționat din oțel de calitate, oferă o protecție solidă.';
      break;
    case 'Posedat':
      description += ' Item posedat de spirite antice, conferă puteri deosebite în luptă.';
      break;
    case 'Cianit':
      description += ' Forjat din mineralul rar cianit, are proprietăți magice remarcabile.';
      break;
    case 'Avansata Rubin':
      description += ' Încrustat cu rubine și îmbunătățit prin magie avansată, este un artefact de mare putere.';
      break;
  }
  
  return description;
}

// Calculate price based on item type and level
function calculatePrice(type, level) {
  // Base price
  let basePrice = level * 100;
  
  // Multiplier based on item type
  const multipliers = {
    'weapon': 3,
    'armor': 2.5,
    'helmet': 1.8,
    'shield': 1.5,
    'bracelet': 1.2,
    'earrings': 1.3,
    'necklace': 1.4,
    'boots': 1.1
  };
  
  return Math.floor(basePrice * multipliers[type]);
}

// Calculate drop rate based on level
function calculateDropRate(level) {
  // Higher level items are rarer
  return Math.max(0.01, 0.5 - (level * 0.01));
}

// Run the function
loadItems().catch(console.error);