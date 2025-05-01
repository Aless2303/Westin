import mongoose, { Document, Schema } from 'mongoose';

export interface IMob extends Document {
  name: string;
  x: number;
  y: number;
  type: string;
  level: number;
  hp: number;
  attack: number;
  exp: number;
  yang: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const mobSchema = new Schema<IMob>(
  {
    name: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['boss', 'metin', 'Oras'],
    },
    level: {
      type: Number,
      required: true,
      default: 1,
    },
    hp: {
      type: Number,
      required: true,
      default: 100,
    },
    attack: {
      type: Number,
      required: true,
      default: 10,
    },
    exp: {
      type: Number,
      required: true,
      default: 10,
    },
    yang: {
      type: Number,
      required: true,
      default: 10,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Mob = mongoose.model<IMob>('Mob', mobSchema);

export default Mob;