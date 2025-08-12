import React from 'react';
import { Socket } from 'socket.io-client';

// Types
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isAdmin?: boolean;
  canUseMic?: boolean;
  canUseCamera?: boolean;
  hasMicPermission?: boolean;
  hasCameraPermission?: boolean;
  isHost?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderAvatar: string;
  timestamp: Date;
  senderId: string;
}

export interface AppContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentUser: Participant | null;
  currentRoom: string | null;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

// Context for global app state
export const AppContext = React.createContext<AppContextType>({
  socket: null,
  isConnected: false,
  currentUser: null,
  currentRoom: null,
  participants: [],
  setParticipants: () => {},
  messages: [],
  setMessages: () => {},
});
