import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  characterId: mongoose.Types.ObjectId;
  type: string;
  subject: string;
  content: string;
  read: boolean;
  playerName?: string;
  mobName?: string;
  mobType?: string;
  result?: string;
  combatStats?: {
    playerHpLost: number;
    damageDealt: number;
    expGained: number;
    yangGained: number;
    totalRounds: number;
    remainingMobHp: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['duel', 'attack', 'sleep'],
    },
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    playerName: {
      type: String,
    },
    mobName: {
      type: String,
    },
    mobType: {
      type: String,
      enum: ['boss', 'metin', 'duel', 'town', 'sleep'],
    },
    result: {
      type: String,
      enum: ['victory', 'defeat'],
    },
    combatStats: {
      playerHpLost: {
        type: Number,
        default: 0,
      },
      damageDealt: {
        type: Number,
        default: 0,
      },
      expGained: {
        type: Number,
        default: 0,
      },
      yangGained: {
        type: Number,
        default: 0,
      },
      totalRounds: {
        type: Number,
        default: 0,
      },
      remainingMobHp: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model<IReport>('Report', reportSchema);

export default Report;