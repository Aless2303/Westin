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

    // Check if user is authorized to view this character's inventory
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to view this inventory', 401);
    }

    // Get inventory with populated item data
    const inventory = await Inventory.findOne({ characterId }).populate({
      path: 'equippedItems.weapon equippedItems.helmet equippedItems.armor equippedItems.shield equippedItems.earrings equippedItems.bracelet equippedItems.necklace equippedItems.boots backpack.itemId',
      model: 'Item'
    });

    if (!inventory) {
      // Create empty inventory if it doesn't exist
      const newInventory = await Inventory.create({
        characterId,
        equippedItems: {},
        backpack: [],
        maxSlots: 20
      });

      res.status(200).json(newInventory);
    }

    res.status(200).json(inventory);
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
    const { itemId, slot } = req.body;

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
    const backpackItemIndex = inventory.backpack.findIndex(
      item => item.slot === slot && item.itemId.toString() === itemId
    );

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
      throw new ApiError(`Character level too low (required: ${item.requiredLevel})`, 400);
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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

      // Save inventory
      await inventory.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Get updated inventory with populated items
      const updatedInventory = await Inventory.findOne({ characterId }).populate({
        path: 'equippedItems.weapon equippedItems.helmet equippedItems.armor equippedItems.shield equippedItems.earrings equippedItems.bracelet equippedItems.necklace equippedItems.boots backpack.itemId',
        model: 'Item'
      });

      res.status(200).json(updatedInventory);
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
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

// @desc    Unequip item
// @route   PUT /api/inventory/:characterId/unequip
// @access  Private
export const unequipItem = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const { itemType } = req.body;

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

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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
      (inventory.equippedItems as any)[itemType] = undefined;

      // Save inventory
      await inventory.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Get updated inventory with populated items
      const updatedInventory = await Inventory.findOne({ characterId }).populate({
        path: 'equippedItems.weapon equippedItems.helmet equippedItems.armor equippedItems.shield equippedItems.earrings equippedItems.bracelet equippedItems.necklace equippedItems.boots backpack.itemId',
        model: 'Item'
      });

      res.status(200).json(updatedInventory);
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
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

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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
      await inventory.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Get updated inventory with populated items
      const updatedInventory = await Inventory.findOne({ characterId }).populate({
        path: 'equippedItems.weapon equippedItems.helmet equippedItems.armor equippedItems.shield equippedItems.earrings equippedItems.bracelet equippedItems.necklace equippedItems.boots backpack.itemId',
        model: 'Item'
      });

      res.status(200).json(updatedInventory);
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
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