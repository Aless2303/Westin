import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  receiverId?: mongoose.Types.ObjectId;
  receiverName?: string;
  content: string;
  timestamp: Date;
  isGlobal: boolean;
  isRead: boolean;
  conversationId?: string;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiverName: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    conversationId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

export default ChatMessage; 