import mongoose, { Document, Schema } from 'mongoose';

export interface IWork extends Document {
  characterId: mongoose.Types.ObjectId;
  type: string;
  remainingTime: number;
  travelTime: number;
  isInProgress: boolean;
  mobName: string;
  mobImage: string;
  mobX: number;
  mobY: number;
  mobType: string;
  mobLevel: number;
  mobHp: number;
  mobAttack: number;
  mobExp: number;
  mobYang: number;
  staminaCost: number;
  originalTravelTime: number;
  originalJobTime: number;
  startTime: Date;
  travelEndTime: Date;
  jobEndTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workSchema = new Schema<IWork>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['15s', '10m', '1h'],
    },
    remainingTime: {
      type: Number,
      required: true,
    },
    travelTime: {
      type: Number,
      required: true,
    },
    isInProgress: {
      type: Boolean,
      required: true,
      default: false,
    },
    mobName: {
      type: String,
      required: true,
    },
    mobImage: {
      type: String,
      required: true,
    },
    mobX: {
      type: Number,
      required: true,
    },
    mobY: {
      type: Number,
      required: true,
    },
    mobType: {
      type: String,
      required: true,
      enum: ['boss', 'metin', 'duel', 'town', 'sleep'],
    },
    mobLevel: {
      type: Number,
      required: true,
    },
    mobHp: {
      type: Number,
      required: true,
    },
    mobAttack: {
      type: Number,
      required: true,
    },
    mobExp: {
      type: Number,
      required: true,
    },
    mobYang: {
      type: Number,
      required: true,
    },
    staminaCost: {
      type: Number,
      required: true,
    },
    originalTravelTime: {
      type: Number,
      required: true,
    },
    originalJobTime: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    travelEndTime: {
      type: Date,
      required: true,
    },
    jobEndTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Work = mongoose.model<IWork>('Work', workSchema);

export default Work; 