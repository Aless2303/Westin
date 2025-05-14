import { Request, Response } from 'express';
import Inventory from '../models/inventoryModel';
import Item from '../models/itemModel';
import Character from '../models/characterModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

// @desc    Get character inventory
// @route   GET /api/inventory/:characterId
// @access  Private
export const getInventory = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // We're no longer restricting view access to equipped items, but we still check for user
    // authentication when modifying the inventory in other functions

    // Get inventory with populated item data
    let inventory = await Inventory.findOne({ characterId });

    if (!inventory) {
      // Create empty inventory if it doesn't exist
      inventory = await Inventory.create({
        characterId,
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
    }

    const populatedInventory = await Inventory.findById(inventory._id);
    const result = populatedInventory?.toObject();
    
    // Check if user is authorized to view full inventory including backpack
    const isAuthorized = req.user && (
      character.userId.toString() === req.user._id.toString() || 
      req.user.isAdmin
    );
    
    // Populate each equipped item with full details
    if (result && result.equippedItems) {
      const equippedSlots = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
      
      // Create a populated version of equippedItems
      const populatedEquippedItems: any = {};
      
      // Populate each slot
      for (const slot of equippedSlots) {
        const itemId = (result.equippedItems as any)[slot];
        if (itemId) {
          const item = await Item.findById(itemId);
          if (item) {
            populatedEquippedItems[slot] = item;
          }
        }
      }
      
      // Replace the equipped items with populated versions
      result.equippedItems = populatedEquippedItems;
    }
    
    // Only return backpack contents if user is authorized
    if (result && !isAuthorized) {
      result.backpack = [];
    }
    // Populate backpack items if user is authorized
    else if (result && result.backpack && result.backpack.length > 0) {
      const populatedBackpack = await Promise.all(
        result.backpack.map(async (backpackItem: any) => {
          const item = await Item.findById(backpackItem.itemId);
          return {
            ...backpackItem,
            itemId: item
          };
        })
      );
      
      result.backpack = populatedBackpack;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Equip item
// @route   PUT /api/inventory/:characterId/equip
// @access  Private
export const equipItem = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const { itemId, slot, statsUpdate } = req.body;

    // Validate parameters
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError('Invalid IDs provided', 400);
    }

    if (slot === undefined || slot < 0) {
      throw new ApiError('Invalid slot number', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to modify this inventory', 401);
    }

    // Get inventory
    const inventory = await Inventory.findOne({ characterId });

    if (!inventory) {
      throw new ApiError('Inventory not found', 404);
    }

    // Get item from inventory's backpack
    // First try to find by slot AND itemId
    let backpackItemIndex = inventory.backpack.findIndex(
      item => item.slot === slot && item.itemId.toString() === itemId
    );

    // If not found by slot AND itemId, try just by itemId
    if (backpackItemIndex === -1) {
      backpackItemIndex = inventory.backpack.findIndex(
        item => item.itemId.toString() === itemId
      );
    }

    if (backpackItemIndex === -1) {
      throw new ApiError('Item not found in backpack', 404);
    }

    // Get item details
    const item = await Item.findById(itemId);

    if (!item) {
      throw new ApiError('Item not found', 404);
    }

    // Check if item can be equipped
    const validSlots = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
    if (!validSlots.includes(item.type)) {
      throw new ApiError('This item cannot be equipped', 400);
    }

    // Check if character level is high enough
    if (character.level < item.requiredLevel) {
      throw new ApiError(`Nu poți echipa acest item. Nivel necesar: ${item.requiredLevel}. Nivelul tău actual: ${character.level}.`, 400);
    }

    // Remove item from backpack
    const itemToRemove = inventory.backpack[backpackItemIndex];
    inventory.backpack.splice(backpackItemIndex, 1);

    // Get currently equipped item if any
    const currentlyEquippedId = (inventory.equippedItems as any)[item.type];
    
    // If there's already an item equipped in this slot, move it to backpack
    if (currentlyEquippedId) {
      // Find first available slot
      let availableSlot = 0;
      const usedSlots = inventory.backpack.map(item => item.slot);
      
      while (usedSlots.includes(availableSlot)) {
        availableSlot++;
      }

      // Check if inventory is full
      if (availableSlot >= inventory.maxSlots) {
        throw new ApiError('Inventory is full', 400);
      }

      // Add previously equipped item to backpack
      inventory.backpack.push({
        itemId: currentlyEquippedId,
        quantity: 1,
        slot: availableSlot
      });
    }

    // Equip new item
    (inventory.equippedItems as any)[item.type] = itemToRemove.itemId;

    // Update character stats if statsUpdate provided
    if (statsUpdate) {
      // Main stats from frontend - attack and defense
      if (statsUpdate.attack) {
        character.attack += statsUpdate.attack;
      }
      if (statsUpdate.defense) {
        character.defense += statsUpdate.defense;
      }
      
      // Save character with updated stats
      await character.save();
    }

    // Save inventory
    await inventory.save();

    // Get updated inventory with populated items
    const updatedInventory = await Inventory.findOne({ characterId });
    const result = updatedInventory?.toObject();
    
    // Populate each equipped item with full details
    if (result && result.equippedItems) {
      const equippedSlots = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
      
      // Create a populated version of equippedItems
      const populatedEquippedItems: any = {};
      
      // Populate each slot
      for (const slot of equippedSlots) {
        const itemId = (result.equippedItems as any)[slot];
        if (itemId) {
          const item = await Item.findById(itemId);
          if (item) {
            populatedEquippedItems[slot] = item;
          }
        }
      }
      
      // Replace the equipped items with populated versions
      result.equippedItems = populatedEquippedItems;
    }
    
    // Populate backpack items
    if (result && result.backpack && result.backpack.length > 0) {
      const populatedBackpack = await Promise.all(
        result.backpack.map(async (backpackItem: any) => {
          const item = await Item.findById(backpackItem.itemId);
          return {
            ...backpackItem,
            itemId: item
          };
        })
      );
      
      result.backpack = populatedBackpack;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Unequip item
// @route   PUT /api/inventory/:characterId/unequip
// @access  Private
export const unequipItem = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const { itemType, statsUpdate } = req.body;

    // Validate parameters
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    if (!itemType) {
      throw new ApiError('Item type is required', 400);
    }

    // Validate item type
    const validTypes = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
    if (!validTypes.includes(itemType)) {
      throw new ApiError('Invalid item type', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to modify this inventory', 401);
    }

    // Get inventory
    const inventory = await Inventory.findOne({ characterId });

    if (!inventory) {
      throw new ApiError('Inventory not found', 404);
    }

    // Check if item is equipped
    const equippedItemId = (inventory.equippedItems as any)[itemType];
    if (!equippedItemId) {
      throw new ApiError('No item equipped in this slot', 404);
    }

    // Find first available slot in backpack
    let availableSlot = 0;
    const usedSlots = inventory.backpack.map(item => item.slot);
    
    while (usedSlots.includes(availableSlot)) {
      availableSlot++;
    }

    // Check if inventory is full
    if (availableSlot >= inventory.maxSlots) {
      throw new ApiError('Inventory is full', 400);
    }

    // Add unequipped item to backpack
    inventory.backpack.push({
      itemId: equippedItemId,
      quantity: 1,
      slot: availableSlot
    });

    // Remove item from equipped items
    (inventory.equippedItems as any)[itemType] = null;

    // Update character stats if statsUpdate provided
    if (statsUpdate) {
      // Main stats from frontend - attack and defense
      // statsUpdate should contain negative values (to be subtracted)
      if (statsUpdate.attack) {
        character.attack += statsUpdate.attack; // Will subtract since statsUpdate.attack is negative
      }
      if (statsUpdate.defense) {
        character.defense += statsUpdate.defense; // Will subtract since statsUpdate.defense is negative
      }
      
      // Save character with updated stats
      await character.save();
    }

    // Save inventory
    await inventory.save();

    // Get updated inventory with populated items
    const updatedInventory = await Inventory.findOne({ characterId });
    const result = updatedInventory?.toObject();
    
    // Populate each equipped item with full details
    if (result && result.equippedItems) {
      const equippedSlots = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
      
      // Create a populated version of equippedItems
      const populatedEquippedItems: any = {};
      
      // Populate each slot
      for (const slot of equippedSlots) {
        const itemId = (result.equippedItems as any)[slot];
        if (itemId) {
          const item = await Item.findById(itemId);
          if (item) {
            populatedEquippedItems[slot] = item;
          }
        }
      }
      
      // Replace the equipped items with populated versions
      result.equippedItems = populatedEquippedItems;
    }
    
    // Populate backpack items
    if (result && result.backpack && result.backpack.length > 0) {
      const populatedBackpack = await Promise.all(
        result.backpack.map(async (backpackItem: any) => {
          const item = await Item.findById(backpackItem.itemId);
          return {
            ...backpackItem,
            itemId: item
          };
        })
      );
      
      result.backpack = populatedBackpack;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Add item to inventory
// @route   POST /api/inventory/:characterId/items
// @access  Private
export const addItemToInventory = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const { itemId, quantity = 1, slot } = req.body;

    // Validate parameters
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError('Invalid IDs provided', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to modify this inventory', 401);
    }

    // Get item
    const item = await Item.findById(itemId);

    if (!item) {
      throw new ApiError('Item not found', 404);
    }

    // Get inventory
    const inventory = await Inventory.findOne({ characterId });

    if (!inventory) {
      throw new ApiError('Inventory not found', 404);
    }

    // Find slot to place the item
    let targetSlot = slot !== undefined ? slot : -1;

    // If no slot specified, find first available
    if (targetSlot === -1) {
      const usedSlots = inventory.backpack.map(item => item.slot);
      let availableSlot = 0;
      
      while (usedSlots.includes(availableSlot)) {
        availableSlot++;
      }
      
      targetSlot = availableSlot;
    }

    // Check if inventory is full
    if (targetSlot >= inventory.maxSlots) {
      throw new ApiError('Inventory is full', 400);
    }

    // Check if slot is already occupied
    const existingItemIndex = inventory.backpack.findIndex(
      item => item.slot === targetSlot
    );

    // Handle item placement or stacking
    if (existingItemIndex !== -1) {
      const existingItem = inventory.backpack[existingItemIndex];
      
      // If same item and stackable, increase quantity
      if (existingItem.itemId.toString() === itemId && item.stackable) {
        existingItem.quantity += quantity;
        inventory.backpack[existingItemIndex] = existingItem;
      } else {
        // Different item or not stackable, find another slot
        const usedSlots = inventory.backpack.map(item => item.slot);
        let availableSlot = 0;
        
        while (usedSlots.includes(availableSlot)) {
          availableSlot++;
        }
        
        if (availableSlot >= inventory.maxSlots) {
          throw new ApiError('Inventory is full', 400);
        }
        
        inventory.backpack.push({
          itemId: new mongoose.Types.ObjectId(itemId),
          quantity,
          slot: availableSlot
        });
      }
    } else {
      // Slot is free, add item
      inventory.backpack.push({
        itemId: new mongoose.Types.ObjectId(itemId),
        quantity,
        slot: targetSlot
      });
    }

    // Save inventory
    await inventory.save();
    
    // Get updated inventory with populated items
    const updatedInventory = await Inventory.findOne({ characterId });
    const result = updatedInventory?.toObject();
    
    // Populate each equipped item with full details
    if (result && result.equippedItems) {
      const equippedSlots = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
      
      // Create a populated version of equippedItems
      const populatedEquippedItems: any = {};
      
      // Populate each slot
      for (const slot of equippedSlots) {
        const itemId = (result.equippedItems as any)[slot];
        if (itemId) {
          const item = await Item.findById(itemId);
          if (item) {
            populatedEquippedItems[slot] = item;
          }
        }
      }
      
      // Replace the equipped items with populated versions
      result.equippedItems = populatedEquippedItems;
    }
    
    // Populate backpack items
    if (result && result.backpack && result.backpack.length > 0) {
      const populatedBackpack = await Promise.all(
        result.backpack.map(async (backpackItem: any) => {
          const item = await Item.findById(backpackItem.itemId);
          return {
            ...backpackItem,
            itemId: item
          };
        })
      );
      
      result.backpack = populatedBackpack;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Initialize character inventory with race-specific starter items
// @route   POST /api/inventory/:characterId/initialize
// @access  Private
export const initializeCharacterInventory = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to initialize this inventory', 401);
    }

    // Get race-specific level 1 starter items (weapon, armor, helmet)
    const raceSpecificItems = await Item.find({
      raceRestriction: character.race,
      requiredLevel: 1,
      type: { $in: ['weapon', 'armor', 'helmet'] }
    });

    // Get general items for the other slots (no race restriction)
    const generalItems = await Item.find({
      raceRestriction: { $exists: false },
      requiredLevel: 1,
      type: { $in: ['shield', 'earrings', 'bracelet', 'necklace', 'boots'] }
    });

    // If no general items found, try to get any items without race restriction
    const allItems = [...raceSpecificItems];
    
    for (const type of ['shield', 'earrings', 'bracelet', 'necklace', 'boots']) {
      const typeItems = generalItems.filter(item => item.type === type);
      
      if (typeItems.length > 0) {
        // Add the first item of this type
        allItems.push(typeItems[0]);
      } else {
        // Try to find any item of this type without race restriction
        const anyItem = await Item.findOne({
          type,
          requiredLevel: 1,
          $or: [
            { raceRestriction: { $exists: false } },
            { raceRestriction: null }
          ]
        });
        
        if (anyItem) {
          allItems.push(anyItem);
        }
      }
    }

    // Group items by type
    const itemsByType: Record<string, mongoose.Types.ObjectId> = {};
    allItems.forEach(item => {
      itemsByType[item.type] = item._id as unknown as mongoose.Types.ObjectId;
    });

    // Check if inventory already exists
    const existingInventory = await Inventory.findOne({ characterId });
    
    if (existingInventory) {
      // Update existing inventory with race-specific equipment
      existingInventory.equippedItems = {
        weapon: itemsByType['weapon'] || null,
        armor: itemsByType['armor'] || null,
        helmet: itemsByType['helmet'] || null,
        shield: itemsByType['shield'] || null,
        earrings: itemsByType['earrings'] || null,
        bracelet: itemsByType['bracelet'] || null,
        necklace: itemsByType['necklace'] || null,
        boots: itemsByType['boots'] || null
      };
      
      await existingInventory.save();
      
      // Return populated inventory
      const populatedInventory = await Inventory.findById(existingInventory._id).populate({
        path: 'equippedItems.weapon equippedItems.helmet equippedItems.armor equippedItems.shield equippedItems.earrings equippedItems.bracelet equippedItems.necklace equippedItems.boots',
        model: 'Item'
      });
      
      res.status(200).json(populatedInventory);
    } else {
      // Create new inventory with equipped items
      const newInventory = await Inventory.create({
        characterId,
        equippedItems: {
          weapon: itemsByType['weapon'] || null,
          armor: itemsByType['armor'] || null,
          helmet: itemsByType['helmet'] || null,
          shield: itemsByType['shield'] || null,
          earrings: itemsByType['earrings'] || null,
          bracelet: itemsByType['bracelet'] || null,
          necklace: itemsByType['necklace'] || null,
          boots: itemsByType['boots'] || null
        },
        backpack: [], // Empty backpack
        maxSlots: 20
      });
  
      // Return populated inventory
      const populatedInventory = await Inventory.findById(newInventory._id).populate({
        path: 'equippedItems.weapon equippedItems.helmet equippedItems.armor equippedItems.shield equippedItems.earrings equippedItems.bracelet equippedItems.necklace equippedItems.boots',
        model: 'Item'
      });
  
      res.status(201).json(populatedInventory);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};