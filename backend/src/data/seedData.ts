import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel';
import Character from '../models/characterModel';
import Inventory from '../models/inventoryModel';
import Item from '../models/itemModel';
import bcrypt from 'bcrypt';
import connectDB from '../config/db';

// Încarcă variabilele de mediu
dotenv.config();

// Funcție pentru popularea bazei de date
const seedData = async () => {
  try {
    // Conectare la baza de date
    await connectDB();
    console.log('MongoDB Connected: localhost');

    // Șterge toate datele existente
    await User.deleteMany({});
    await Character.deleteMany({});
    await Inventory.deleteMany({});
    await Item.deleteMany({});
    
    console.log('Datele existente au fost șterse');

    // Hașurează parolele
    const salt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash('user123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    // Creează utilizatorii mai întâi
    const user = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: userPassword,
      isAdmin: false
    });

    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true
    });

    console.log('Utilizatorii au fost creați');

    // Apoi creează caracterele cu ID-urile utilizatorilor
    const userCharacter = await Character.create({
      name: "Ravensword",
      level: 134,
      race: "Ninja",
      gender: "Masculin",
      background: "/Backgrounds/western2.jpg",
      hp: {
        current: 6339,
        max: 7500,
      },
      stamina: {
        current: 84,
        max: 100,
      },
      experience: {
        current: 12345,
        percentage: 63,
      },
      money: {
        cash: 154250,
        bank: 867540,
      },
      x: 350,
      y: 611,
      attack: 5000,
      defense: 200,
      duelsWon: 47,
      duelsLost: 12,
      motto: "Cel mai rapid pistolar din vest. Mereu pe urmele aventurii și a recompensei.",
      userId: user._id
    });

    const adminCharacter = await Character.create({
      name: "AdminWarrior",
      level: 200,
      race: "Warrior",
      gender: "Masculin",
      background: "/Backgrounds/western1.jpg",
      hp: {
        current: 10000,
        max: 10000,
      },
      stamina: {
        current: 100,
        max: 100,
      },
      experience: {
        current: 50000,
        percentage: 80,
      },
      money: {
        cash: 999999,
        bank: 9999999,
      },
      x: 1420,
      y: 1060,
      attack: 9999,
      defense: 999,
      duelsWon: 100,
      duelsLost: 0,
      motto: "Administrator suprem al tărâmului Westin.",
      userId: admin._id
    });

    console.log('Caracterele au fost create');

    // Actualizează utilizatorii cu ID-urile caracterelor
    user.characterId = userCharacter._id as unknown as mongoose.Types.ObjectId;
    admin.characterId = adminCharacter._id as unknown as mongoose.Types.ObjectId;

    await user.save();
    await admin.save();

    console.log('Utilizatorii au fost actualizați cu ID-urile caracterelor');

    // Creează inventarele pentru utilizatori
    await Inventory.create({
      characterId: userCharacter._id,
      equippedItems: {
        weapon: null,
        helmet: null,
        armor: null,
        shield: null,
        earrings: null,
        bracelet: null,
        necklace: null,
        boots: null
      },
      backpack: [],
      maxSlots: 20
    });

    await Inventory.create({
      characterId: adminCharacter._id,
      equippedItems: {
        weapon: null,
        helmet: null,
        armor: null,
        shield: null,
        earrings: null,
        bracelet: null,
        necklace: null,
        boots: null
      },
      backpack: [],
      maxSlots: 30
    });

    console.log('Inventarele au fost create');

    console.log('Datele de test au fost adăugate cu succes');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la popularea bazei de date:', error);
    process.exit(1);
  }
};

// Rulează funcția de populare
seedData();