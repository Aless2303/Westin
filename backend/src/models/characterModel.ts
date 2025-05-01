import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacter extends Document {
  name: string;
  level: number;
  race: string;
  gender: string;
  background: string;
  hp: {
    current: number;
    max: number;
  };
  stamina: {
    current: number;
    max: number;
  };
  experience: {
    current: number;
    percentage: number;
  };
  money: {
    cash: number;
    bank: number;
  };
  x: number;
  y: number;
  attack: number;
  defense: number;
  duelsWon: number;
  duelsLost: number;
  motto: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      required: true,
      default: 1,
    },
    race: {
      type: String,
      required: true,
      enum: ['Warrior', 'Ninja', 'Sura', 'Shaman'],
    },
    gender: {
      type: String,
      required: true,
      enum: ['Masculin', 'Feminin'],
    },
    background: {
      type: String,
      default: '/Backgrounds/western1.jpg',
    },
    hp: {
      current: {
        type: Number,
        required: true,
        default: 100,
      },
      max: {
        type: Number,
        required: true,
        default: 100,
      },
    },
    stamina: {
      current: {
        type: Number,
        required: true,
        default: 100,
      },
      max: {
        type: Number,
        required: true,
        default: 100,
      },
    },
    experience: {
      current: {
        type: Number,
        required: true,
        default: 0,
      },
      percentage: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    money: {
      cash: {
        type: Number,
        required: true,
        default: 1000,
      },
      bank: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    x: {
      type: Number,
      required: true,
      default: 350,
    },
    y: {
      type: Number,
      required: true,
      default: 611,
    },
    attack: {
      type: Number,
      required: true,
      default: 10,
    },
    defense: {
      type: Number,
      required: true,
      default: 5,
    },
    duelsWon: {
      type: Number,
      default: 0,
    },
    duelsLost: {
      type: Number,
      default: 0,
    },
    motto: {
      type: String,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Character = mongoose.model<ICharacter>('Character', characterSchema);

export default Character;