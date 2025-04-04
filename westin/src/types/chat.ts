export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  receiverName?: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface GlobalChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface PrivateConversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  messages: ChatMessage[];
  lastActivity: number;
  isAccepted: boolean;
}

export enum ChatType {
  GLOBAL = 'global',
  PRIVATE = 'private'
} 