// Definirea tipului pentru un item
export interface ItemType {
  id: string;
  name: string;
  type: string;
  category: string;
  subcategory?: string;
  price: number;
  imagePath: string;
  level: number;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    stamina?: number;
  };
}

// Funcția pentru generarea unui ID unic
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Lista cu toate itemele din magazin
export const items: ItemType[] = [
  // Arme pentru Warrior
  {
    id: generateId(),
    name: "Warrior Sabie Începător",
    type: "weapon",
    category: "Weapons",
    subcategory: "Warrior",
    price: 1000,
    level: 1,
    imagePath: "/Items/Weapons/Warrior/Warrior Weapons Incepator - LvL 1.png",
    stats: { attack: 10 }
  },
  {
    id: generateId(),
    name: "Warrior Sabie Oțel",
    type: "weapon",
    category: "Weapons",
    subcategory: "Warrior",
    price: 2500,
    level: 11,
    imagePath: "/Items/Weapons/Warrior/Warrior Weapons Otel - LvL 11.png",
    stats: { attack: 20 }
  },
  {
    id: generateId(),
    name: "Warrior Sabie Posedat",
    type: "weapon",
    category: "Weapons",
    subcategory: "Warrior",
    price: 5000,
    level: 25,
    imagePath: "/Items/Weapons/Warrior/Warrior Weapons Posedat - LvL 25.png",
    stats: { attack: 30 }
  },
  {
    id: generateId(),
    name: "Warrior Sabie Cianit",
    type: "weapon",
    category: "Weapons",
    subcategory: "Warrior",
    price: 10000,
    level: 35,
    imagePath: "/Items/Weapons/Warrior/Warrior Weapons Cianit - LvL 35.png",
    stats: { attack: 40 }
  },
  {
    id: generateId(),
    name: "Warrior Sabie Avansată Rubin",
    type: "weapon",
    category: "Weapons",
    subcategory: "Warrior",
    price: 20000,
    level: 49,
    imagePath: "/Items/Weapons/Warrior/Warrior Weapons Avansata Rubin - LvL 49.png",
    stats: { attack: 50 }
  },
  
  // Arme pentru Ninja
  {
    id: generateId(),
    name: "Ninja Dagă Începător",
    type: "weapon",
    category: "Weapons",
    subcategory: "Ninja",
    price: 1000,
    level: 1,
    imagePath: "/Items/Weapons/Ninja/Ninja Weapons Incepator - LvL 1.png",
    stats: { attack: 8, stamina: 5 }
  },
  {
    id: generateId(),
    name: "Ninja Dagă Oțel",
    type: "weapon",
    category: "Weapons",
    subcategory: "Ninja",
    price: 2500,
    level: 11,
    imagePath: "/Items/Weapons/Ninja/Ninja Weapons Otel - LvL 11.png",
    stats: { attack: 15, stamina: 10 }
  },
  {
    id: generateId(),
    name: "Ninja Dagă Posedat",
    type: "weapon",
    category: "Weapons",
    subcategory: "Ninja",
    price: 5000,
    level: 25,
    imagePath: "/Items/Weapons/Ninja/Ninja Weapons Posedat - LvL 25.png",
    stats: { attack: 25, stamina: 15 }
  },
  {
    id: generateId(),
    name: "Ninja Dagă Cianit",
    type: "weapon",
    category: "Weapons",
    subcategory: "Ninja",
    price: 10000,
    level: 35,
    imagePath: "/Items/Weapons/Ninja/Ninja Weapons Cianit - LvL 35.png",
    stats: { attack: 35, stamina: 20 }
  },
  {
    id: generateId(),
    name: "Ninja Dagă Avansată Rubin",
    type: "weapon",
    category: "Weapons",
    subcategory: "Ninja",
    price: 20000,
    level: 49,
    imagePath: "/Items/Weapons/Ninja/Ninja Weapons Avansata Rubin - LvL 49.png",
    stats: { attack: 45, stamina: 25 }
  },
  
  // Armuri pentru Warrior
  {
    id: generateId(),
    name: "Warrior Armură Începător",
    type: "armor",
    category: "Armours",
    subcategory: "Warrior",
    price: 1500,
    level: 1,
    imagePath: "/Items/Armours/Warrior/Warrior Armours Incepator - LvL 1.png",
    stats: { defense: 15 }
  },
  {
    id: generateId(),
    name: "Warrior Armură Oțel",
    type: "armor",
    category: "Armours",
    subcategory: "Warrior",
    price: 3000,
    level: 11,
    imagePath: "/Items/Armours/Warrior/Warrior Armours Otel - LvL 11.png",
    stats: { defense: 25 }
  },
  {
    id: generateId(),
    name: "Warrior Armură Posedat",
    type: "armor",
    category: "Armours",
    subcategory: "Warrior",
    price: 6000,
    level: 25,
    imagePath: "/Items/Armours/Warrior/Warrior Armours Posedat - LvL 25.png",
    stats: { defense: 35 }
  },
  {
    id: generateId(),
    name: "Warrior Armură Cianit",
    type: "armor",
    category: "Armours",
    subcategory: "Warrior",
    price: 12000,
    level: 35,
    imagePath: "/Items/Armours/Warrior/Warrior Armours Cianit - LvL 35.png",
    stats: { defense: 45 }
  },
  {
    id: generateId(),
    name: "Warrior Armură Avansată Rubin",
    type: "armor",
    category: "Armours",
    subcategory: "Warrior",
    price: 24000,
    level: 49,
    imagePath: "/Items/Armours/Warrior/Warrior Armours Avansata Rubin - LvL 49.png",
    stats: { defense: 55 }
  },
  
  // Coifuri pentru Warrior
  {
    id: generateId(),
    name: "Warrior Coif Începător",
    type: "helmet",
    category: "Coif",
    subcategory: "Warrior",
    price: 800,
    level: 1,
    imagePath: "/Items/Coif/Warrior/Warrior Coif Incepator - LvL 1.png",
    stats: { defense: 5 }
  },
  {
    id: generateId(),
    name: "Warrior Coif Oțel",
    type: "helmet",
    category: "Coif",
    subcategory: "Warrior",
    price: 1800,
    level: 11,
    imagePath: "/Items/Coif/Warrior/Warrior Coif Otel - LvL 11.png",
    stats: { defense: 10 }
  },
  {
    id: generateId(),
    name: "Warrior Coif Posedat",
    type: "helmet",
    category: "Coif",
    subcategory: "Warrior",
    price: 3600,
    level: 25,
    imagePath: "/Items/Coif/Warrior/Warrior Coif Posedat - LvL 25.png",
    stats: { defense: 15 }
  },
  {
    id: generateId(),
    name: "Warrior Coif Cianit",
    type: "helmet",
    category: "Coif",
    subcategory: "Warrior",
    price: 7200,
    level: 35,
    imagePath: "/Items/Coif/Warrior/Warrior Coif Cianit - LvL 35.png",
    stats: { defense: 20 }
  },
  {
    id: generateId(),
    name: "Warrior Coif Avansată Rubin",
    type: "helmet",
    category: "Coif",
    subcategory: "Warrior",
    price: 14400,
    level: 49,
    imagePath: "/Items/Coif/Warrior/Warrior Coif Avansata Rubin - LvL 49.png",
    stats: { defense: 25 }
  },
  
  // Papuci (încălțăminte)
  {
    id: generateId(),
    name: "Papuci Începător",
    type: "boots",
    category: "Papuci",
    price: 600,
    level: 1,
    imagePath: "/Items/Papuci/Papuci Incepator - LvL 1.png",
    stats: { defense: 3, stamina: 2 }
  },
  {
    id: generateId(),
    name: "Papuci Oțel",
    type: "boots",
    category: "Papuci",
    price: 1500,
    level: 11,
    imagePath: "/Items/Papuci/Papuci Otel - LvL 11.png",
    stats: { defense: 6, stamina: 4 }
  },
  {
    id: generateId(),
    name: "Papuci Posedat",
    type: "boots",
    category: "Papuci",
    price: 3000,
    level: 25,
    imagePath: "/Items/Papuci/Papuci Posedat - LvL 25.png",
    stats: { defense: 9, stamina: 6 }
  },
  {
    id: generateId(),
    name: "Papuci Cianit",
    type: "boots",
    category: "Papuci",
    price: 6000,
    level: 35,
    imagePath: "/Items/Papuci/Papuci Cianit - LvL 35.png",
    stats: { defense: 12, stamina: 8 }
  },
  {
    id: generateId(),
    name: "Papuci Avansată Rubin",
    type: "boots",
    category: "Papuci",
    price: 12000,
    level: 49,
    imagePath: "/Items/Papuci/Papuci Avansata Rubin - LvL 49.png",
    stats: { defense: 15, stamina: 10 }
  },
  
  // Coliere
  {
    id: generateId(),
    name: "Colier Începător",
    type: "necklace",
    category: "Colier",
    price: 1000,
    level: 1,
    imagePath: "/Items/Colier/Colier Incepator - LvL 1.png",
    stats: { health: 5 }
  },
  {
    id: generateId(),
    name: "Colier Oțel",
    type: "necklace",
    category: "Colier",
    price: 2500,
    level: 11,
    imagePath: "/Items/Colier/Colier Otel - LvL 11.png",
    stats: { health: 15 }
  },
  {
    id: generateId(),
    name: "Colier Posedat",
    type: "necklace",
    category: "Colier",
    price: 5000,
    level: 25,
    imagePath: "/Items/Colier/Colier Posedat - LvL 25.png",
    stats: { health: 25 }
  },
  {
    id: generateId(),
    name: "Colier Cianit",
    type: "necklace",
    category: "Colier",
    price: 10000,
    level: 35,
    imagePath: "/Items/Colier/Colier Cianit - LvL 35.png",
    stats: { health: 35 }
  },
  {
    id: generateId(),
    name: "Colier Avansată Rubin",
    type: "necklace",
    category: "Colier",
    price: 20000,
    level: 49,
    imagePath: "/Items/Colier/Colier Avansata Rubin - LvL 49.png",
    stats: { health: 45 }
  },
  
  // Cercei
  {
    id: generateId(),
    name: "Cercei Începător",
    type: "earrings",
    category: "Cercei",
    price: 800,
    level: 1,
    imagePath: "/Items/Cercei/Cercei Incepator - LvL 1.png",
    stats: { mana: 5 }
  },
  {
    id: generateId(),
    name: "Cercei Oțel",
    type: "earrings",
    category: "Cercei",
    price: 2000,
    level: 11,
    imagePath: "/Items/Cercei/Cercei Otel - LvL 11.png",
    stats: { mana: 15 }
  },
  {
    id: generateId(),
    name: "Cercei Posedat",
    type: "earrings",
    category: "Cercei",
    price: 4000,
    level: 25,
    imagePath: "/Items/Cercei/Cercei Posedat - LvL 25.png",
    stats: { mana: 25 }
  },
  {
    id: generateId(),
    name: "Cercei Cianit",
    type: "earrings",
    category: "Cercei",
    price: 8000,
    level: 35,
    imagePath: "/Items/Cercei/Cercei Cianit - LvL 35.png",
    stats: { mana: 35 }
  },
  {
    id: generateId(),
    name: "Cercei Avansată Rubin",
    type: "earrings",
    category: "Cercei",
    price: 16000,
    level: 49,
    imagePath: "/Items/Cercei/Cercei Avansata Rubin - LvL 49.png",
    stats: { mana: 45 }
  },
  
  // Brățări
  {
    id: generateId(),
    name: "Brățară Începător",
    type: "bracelet",
    category: "Bratara",
    price: 700,
    level: 1,
    imagePath: "/Items/Bratara/Bratara Incepator - LvL 1.png",
    stats: { attack: 2 }
  },
  {
    id: generateId(),
    name: "Brățară Oțel",
    type: "bracelet",
    category: "Bratara",
    price: 1800,
    level: 11,
    imagePath: "/Items/Bratara/Bratara Otel - LvL 11.png",
    stats: { attack: 5 }
  },
  {
    id: generateId(),
    name: "Brățară Posedat",
    type: "bracelet",
    category: "Bratara",
    price: 3600,
    level: 25,
    imagePath: "/Items/Bratara/Bratara Posedat - LvL 25.png",
    stats: { attack: 10 }
  },
  {
    id: generateId(),
    name: "Brățară Cianit",
    type: "bracelet",
    category: "Bratara",
    price: 7200,
    level: 35,
    imagePath: "/Items/Bratara/Bratara Cianit - LvL 35.png",
    stats: { attack: 15 }
  },
  {
    id: generateId(),
    name: "Brățară Avansată Rubin",
    type: "bracelet",
    category: "Bratara",
    price: 14400,
    level: 49,
    imagePath: "/Items/Bratara/Bratara Avansata Rubin - LvL 49.png",
    stats: { attack: 20 }
  },
  
  // Scuturi
  {
    id: generateId(),
    name: "Scut Începător",
    type: "shield",
    category: "Scut",
    price: 900,
    level: 1,
    imagePath: "/Items/Scut/Scut Incepator - LvL 1.png",
    stats: { defense: 7 }
  },
  {
    id: generateId(),
    name: "Scut Oțel",
    type: "shield",
    category: "Scut",
    price: 2200,
    level: 11,
    imagePath: "/Items/Scut/Scut Otel - LvL 11.png",
    stats: { defense: 15 }
  },
  {
    id: generateId(),
    name: "Scut Posedat",
    type: "shield",
    category: "Scut",
    price: 4400,
    level: 25,
    imagePath: "/Items/Scut/Scut Posedat - LvL 25.png",
    stats: { defense: 22 }
  },
  {
    id: generateId(),
    name: "Scut Cianit",
    type: "shield",
    category: "Scut",
    price: 8800,
    level: 35,
    imagePath: "/Items/Scut/Scut Cianit - LvL 35.png",
    stats: { defense: 30 }
  },
  {
    id: generateId(),
    name: "Scut Avansată Rubin",
    type: "shield",
    category: "Scut",
    price: 17600,
    level: 49,
    imagePath: "/Items/Scut/Scut Avansata Rubin - LvL 49.png",
    stats: { defense: 40 }
  }
];

// Funcție pentru a grupa itemele pe categorii
export const itemsByCategory = (): Record<string, ItemType[]> => {
  const categories: Record<string, ItemType[]> = {};
  
  items.forEach((item) => {
    const key = item.subcategory 
      ? `${item.category}-${item.subcategory}` 
      : item.category;
      
    if (!categories[key]) {
      categories[key] = [];
    }
    
    categories[key].push(item);
  });
  
  return categories;
};

// Returneaza toate categoriile disponibile
export const allCategories = (): string[] => {
  const categories = new Set<string>();
  
  items.forEach((item) => {
    categories.add(item.category);
  });
  
  return Array.from(categories);
}; 