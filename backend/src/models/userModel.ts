import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  characterId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// backend/src/models/userModel.ts - verifică metoda matchPassword
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  console.log('Matching password:', enteredPassword); // Pentru debugging
  // Folosește try-catch pentru a gestiona erorile de comparare
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', result); // Pentru debugging
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;