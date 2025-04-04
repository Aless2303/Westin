import { GlobalChatMessage, PrivateConversation } from '../../types/chat';

// Mesaje pentru chat-ul global
export const mockGlobalMessages: GlobalChatMessage[] = [
  {
    id: 'glob1',
    senderId: 'system',
    senderName: 'Sistem',
    content: 'Bine ați venit în lumea Westin!',
    timestamp: Date.now() - 3600000, // acum o oră
  },
  {
    id: 'glob2',
    senderId: 'player1',
    senderName: 'KnightShadow',
    content: 'Salutare tuturor, cine vrea să facă o echipă pentru vânătoare?',
    timestamp: Date.now() - 1800000, // acum 30 minute
  },
  {
    id: 'glob3',
    senderId: 'player2',
    senderName: 'WizardFrost',
    content: 'Eu sunt disponibil pentru vânătoare în zona de nord.',
    timestamp: Date.now() - 1500000, // acum 25 minute
  },
  {
    id: 'glob4',
    senderId: 'player1',
    senderName: 'KnightShadow',
    content: 'Perfect, ne vedem la poarta nordică în 5 minute!',
    timestamp: Date.now() - 1200000, // acum 20 minute
  }
];

// Conversații private între jucători
export const mockPrivateConversations: PrivateConversation[] = [
  {
    id: 'conv1',
    participantIds: ['character', 'player1'],
    participantNames: ['Jucător', 'KnightShadow'],
    messages: [
      {
        id: 'msg1',
        senderId: 'player1',
        senderName: 'KnightShadow',
        receiverId: 'character',
        receiverName: 'Jucător',
        content: 'Salut! Am văzut că ești nou pe server. Ai nevoie de ajutor?',
        timestamp: Date.now() - 1800000, // acum 30 minute
        isRead: false,
      }
    ],
    lastActivity: Date.now() - 1800000,
    isAccepted: false, // În așteptare
  },
  {
    id: 'conv2',
    participantIds: ['character', 'player2'],
    participantNames: ['Jucător', 'WizardFrost'],
    messages: [
      {
        id: 'msg2',
        senderId: 'player2',
        senderName: 'WizardFrost',
        receiverId: 'character',
        receiverName: 'Jucător',
        content: 'Bună! Vrei să facem schimb de poțiuni?',
        timestamp: Date.now() - 3600000, // acum 1 oră
        isRead: true,
      },
      {
        id: 'msg3',
        senderId: 'character',
        senderName: 'Jucător',
        receiverId: 'player2',
        receiverName: 'WizardFrost',
        content: 'Sigur, ce tip de poțiuni ai nevoie?',
        timestamp: Date.now() - 3540000, // acum 59 minute
        isRead: true,
      },
      {
        id: 'msg4',
        senderId: 'player2',
        senderName: 'WizardFrost',
        receiverId: 'character',
        receiverName: 'Jucător',
        content: 'Aș avea nevoie de poțiuni de viață. Îți pot oferi poțiuni de mana în schimb.',
        timestamp: Date.now() - 3480000, // acum 58 minute
        isRead: true,
      }
    ],
    lastActivity: Date.now() - 3480000,
    isAccepted: true, // Acceptată
  }
];

export default {
  globalMessages: mockGlobalMessages,
  privateConversations: mockPrivateConversations
}; 