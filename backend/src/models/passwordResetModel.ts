// backend/src/models/passwordResetModel.ts
import mongoose, { Schema } from 'mongoose';

interface IPasswordReset {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expiră după o oră
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);

export default PasswordReset;