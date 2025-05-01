import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  characterId: mongoose.Types.ObjectId;
  equippedItems: {
    weapon?: mongoose.Types.ObjectId;
    helmet?: mongoose.Types.ObjectId;
    armor?: mongoose.Types.ObjectId;
    shield?: mongoose.Types.ObjectId;
    earrings?: mongoose.Types.ObjectId;
    bracelet?: mongoose.Types.ObjectId;
    necklace?: mongoose.Types.ObjectId;
    boots?: mongoose.Types.ObjectId;
  };
  backpack: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    slot: number;
  }>;
  maxSlots: number;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    equippedItems: {
      weapon: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      helmet: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      armor: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      shield: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      earrings: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      bracelet: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      necklace: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      boots: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
    },
    backpack: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        slot: {
          type: Number,
          required: true,
        },
      },
    ],
    maxSlots: {
      type: Number,
      required: true,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);

export default Inventory;