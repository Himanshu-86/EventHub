import React, { useState, useEffect, createContext } from 'react';
import io, { Socket } from 'socket.io-client';

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
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderAvatar: string;
  timestamp: Date;
  senderId: string;
}

export interface VideoContextType {
  socket: Socket | null;
  currentRoom: string | null;
  currentUser: Participant | null;
  participants: Participant[];
  messages: ChatMessage[];
  isConnected: boolean;
  setCurrentRoom: (roomId: string | null) => void;
}

export const VideoContext = createContext<VideoContextType>({} as VideoContextType);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_VIDEO_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to video server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from video server');
      setIsConnected(false);
    });

        newSocket.on('joined-room', ({ roomId, participant, participants, messages }: { roomId: string; participant: Participant; participants: Participant[]; messages: ChatMessage[] }) => {
      setCurrentRoom(roomId);
      setCurrentUser(participant);
      setParticipants(participants);
      setMessages(messages);
    });

        newSocket.on('user-joined', (data: { participantId: string; userName: string; }) => {
        const newParticipant: Participant = {
          id: data.participantId,
          name: data.userName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userName}`,
          joinedAt: new Date(),
          isVideoEnabled: true,
          isAudioEnabled: true,
          isScreenSharing: false
        };
        setParticipants(prev => [...prev, newParticipant]);
    });

        newSocket.on('user-left', ({ participantId }: { participantId: string }) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    });

        newSocket.on('participants-updated', (updatedParticipants: Participant[]) => {
      setParticipants(updatedParticipants);
    });

        newSocket.on('new-message', (message: any) => {
        const transformedMessage: ChatMessage = {
          id: message.id,
          text: message.message,
          sender: message.userName,
          senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`,
          timestamp: new Date(message.timestamp),
          senderId: message.senderId
        };
        setMessages(prev => [...prev, transformedMessage]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const contextValue: VideoContextType = {
    socket,
    currentRoom,
    currentUser,
    participants,
    messages,
    isConnected,
    setCurrentRoom,
  };

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
};
