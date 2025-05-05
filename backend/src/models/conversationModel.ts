import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  participantNames: string[];
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
conversationSchema.index({ participants: 1 }, { unique: true });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation; 