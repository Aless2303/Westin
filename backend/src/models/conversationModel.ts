import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  participantNames: string[];
  leftParticipants?: mongoose.Types.ObjectId[];
  lastMessageAt: Date;
  isAccepted: boolean;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    participantNames: [{
      type: String,
      required: true,
    }],
    leftParticipants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure unique conversation between two users
// conversationSchema.index({ participants: 1 }, { unique: true });

// Remove the simple index and rely on the custom verification in controller
// We don't want the index to enforce uniqueness as we're checking participants in any order

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation; 