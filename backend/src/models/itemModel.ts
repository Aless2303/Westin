import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  type: string;
  category: string;
  subcategory?: string;
  imagePath: string;
  stackable: boolean;
  quantity?: number;
  requiredLevel: number;
  price: number;
  stats?: {
    [key: string]: number;
  };
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['weapon', 'armor', 'helmet', 'shield', 'earrings', 'bracelet', 'necklace', 'boots', 'consumable', 'quest', 'material'],
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    imagePath: {
      type: String,
      required: true,
    },
    stackable: {
      type: Boolean,
      required: true,
      default: false,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    requiredLevel: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stats: {
      type: Map,
      of: Number,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;