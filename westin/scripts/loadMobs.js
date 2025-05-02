// scripts/loadMobs.js
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function loadMobs() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("westin");
    const mobsCollection = database.collection("mobs");
    
    // Clear existing mobs if needed
    await mobsCollection.deleteMany({});
    console.log("Cleared existing mobs");
    
    // Load mob data from the JSON
    const mobsDirectory = path.join(__dirname, '..', 'public', 'assets', 'images');
    const bossesDirectory = path.join(mobsDirectory, 'bosi');
    const metinsDirectory = path.join(mobsDirectory, 'metine');
    
    // Read mob JSON data
    const mobsData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'mobi.json'), 'utf8'));
    
    console.log(`Found ${mobsData.length} mobs in the JSON file`);
    
    for (const mob of mobsData) {
      let imagePath;
      let imageBuffer;
      
      // Handle special case for Oras
      if (mob.type === "Oras") {
        // Use the town_icon.png from the npc directory for the city
        imagePath = path.join(__dirname, '..', 'public', 'npc', 'town_icon.png');
        
        if (!fs.existsSync(imagePath)) {
          console.log(`City icon not found: ${imagePath}`);
          // Use a default or placeholder image if the town icon isn't found
          // For now, use the image specified in the JSON (if it exists)
          const tempImagePath = path.join(metinsDirectory, path.basename(mob.image.replace("/assets/images/metine/", "")));
          if (fs.existsSync(tempImagePath)) {
            imagePath = tempImagePath;
          } else {
            console.log(`Fallback image not found for Oras. Skipping image.`);
            continue;
          }
        }
      } 
      // Handle boss and metin mobs
      else if (mob.type === "boss") {
        const bossName = path.basename(mob.image).replace("/assets/images/bosi/", "");
        imagePath = path.join(bossesDirectory, bossName);
      } else if (mob.type === "metin") {
        const metinName = path.basename(mob.image).replace("/assets/images/metine/", "");
        imagePath = path.join(metinsDirectory, metinName);
      } else {
        console.log(`Unknown mob type: ${mob.type} for mob ${mob.name}`);
        continue;
      }
      
      // Check if image exists
      if (!fs.existsSync(imagePath)) {
        console.log(`Image not found: ${imagePath} for mob ${mob.name}`);
        continue;
      }
      
      // Read the image
      imageBuffer = fs.readFileSync(imagePath);
      
      // Create mob document with image
      const mobDocument = {
        name: mob.name,
        x: mob.x,
        y: mob.y,
        type: mob.type,
        level: mob.level,
        hp: mob.hp,
        attack: mob.attack,
        exp: mob.exp,
        yang: mob.yang,
        // Add additional fields appropriate for the entity type
        ...(mob.type !== "Oras" ? {
          defense: Math.floor(mob.level * 2.5), // Add some defense based on level
          dropRate: calculateDropRate(mob.level), // Add drop rate based on level
          respawnTime: calculateRespawnTime(mob.type, mob.level), // Add respawn time
          description: generateDescription(mob), // Generate a description
        } : {
          // City-specific properties
          isSafeZone: true,
          hasShops: true,
          hasStorage: true,
          hasTownHall: true,
          services: [
            "merchant", "storage", "rest", "teleport", "quests"
          ],
          description: "Orașul principal din Westin, un refugiu sigur pentru călători și aventurieri. Aici poți găsi negustori, depozite și locuri de odihnă."
        }),
        image: new Binary(imageBuffer)
      };
      
      // Add the mob to the database
      await mobsCollection.insertOne(mobDocument);
      console.log(`Added ${mob.type === "Oras" ? "city" : "mob"}: ${mob.name}`);
    }
    
    console.log("All entities added successfully");
  } catch (error) {
    console.error("Error loading entities:", error);
  } finally {
    await client.close();
  }
}

// Calculate drop rate based on level
function calculateDropRate(level) {
  // Higher level mobs have better drop rates for rare items
  return {
    commonItems: Math.min(0.7, 0.3 + (level * 0.01)),
    rareItems: Math.min(0.3, 0.05 + (level * 0.005)),
    epicItems: Math.min(0.1, 0.01 + (level * 0.002)),
    yang: 1.0, // Always drops yang
    exp: 1.0   // Always gives exp
  };
}

// Calculate respawn time based on type and level
function calculateRespawnTime(type, level) {
  // Bosses take longer to respawn, higher level mobs take longer too
  if (type === "boss") {
    return Math.floor(30 + (level * 0.5)); // Minutes
  } else {
    return Math.floor(5 + (level * 0.2)); // Minutes
  }
}

// Generate a description for the mob
function generateDescription(mob) {
  let description = "";
  
  if (mob.type === "boss") {
    const bossDescriptions = {
      "Alastor": "Un boss puternic cu abilități de gheață care poate congela adversarii din calea sa.",
      "Bos de Apa Gigant": "Un monstru imens care controlează apele și poate provoca inundații devastatoare.",
      "Crab Kerhan": "Un crab uriaș cu cleștii puternici care pot zdrobi armurile cele mai solide.",
      "Bos de Padure Rosu Gigant": "Un gardian al pădurii roșii cu abilități de regenerare și control al naturii.",
      "En-Tai": "Un demon al șerpilor cu abilități de otrăvire și încolăcire rapidă.",
      "Argos": "Un monstru antic cu puterea de a invoca armata de șerpi și de a provoca cutremure.",
      "Maimuta Zeu-Lord": "Un lider al maimuțelor cu inteligență aproape umană și tactici de luptă avansate.",
      "Stone Man": "Un golem de piatră aproape invulnerabil la armele convenționale."
    };
    
    if (bossDescriptions[mob.name]) {
      description = bossDescriptions[mob.name];
    } else {
      description = `Un boss puternic de nivel ${mob.level} cu abilități extraordinare de luptă.`;
    }
    
    description += ` Are ${mob.hp} puncte de viață și poate provoca ${mob.attack} daune cu fiecare lovitură.`;
  } else if (mob.type === "metin") {
    const metinTypes = {
      "Gheata": "Un metin de gheață care răspândește frig și îngheț în jurul său.",
      "Crab": "Un metin legat de puterea crabilor, protejat de o carapace solidă.",
      "Sarpe": "Un metin al șerpilor care emană otravă și coroziune.",
      "Ou": "Un metin în formă de ou care generează constante unde de energie.",
      "Piatra": "Un metin de piatră cu rezistență sporită la atacuri fizice."
    };
    
    let metinType = "misterios";
    for (const [type, desc] of Object.entries(metinTypes)) {
      if (mob.name.includes(type)) {
        metinType = type.toLowerCase();
        description = desc;
        break;
      }
    }
    
    if (!description) {
      description = `Un metin ${metinType} care alterează realitatea din jurul său.`;
    }
    
    description += ` Este de nivel ${mob.level}, are ${mob.hp} puncte de viață și poate provoca ${mob.attack} daune cu fiecare lovitură.`;
  }
  
  return description;
}

loadMobs().catch(console.error);