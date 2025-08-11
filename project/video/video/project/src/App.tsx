/**
 * ProLiteMeet - Professional Video Conferencing App
 * Main application component with routing and global state management
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

// Components
import HomePage from './components/HomePage';
import JoinRoom from './components/JoinRoom';
import MeetingRoom from './components/MeetingRoom';
import LoadingScreen from './components/LoadingScreen';

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
  currentRoom: string | null;
  currentUser: Participant | null;
  participants: Participant[];
  messages: ChatMessage[];
  isConnected: boolean;
}

// Context for global app state
export const AppContext = React.createContext<AppContextType>({
  socket: null,
  currentRoom: null,
  currentUser: null,
  participants: [],
  messages: [],
  isConnected: false
});

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = () => {
      // Use environment variable for backend URL or fallback to localhost
      const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Connected to server:', newSocket.id);
        setIsConnected(true);
        setIsLoading(false);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setIsConnected(false);
        setIsLoading(false);
      });

      // Room event handlers
      newSocket.on('joined-room', ({ roomId, participant, participants: roomParticipants, messages: roomMessages }) => {
        console.log('🏠 Joined room:', roomId);
        console.log('👤 Current participant:', participant);
        console.log('👥 All participants:', roomParticipants);
        
        setCurrentRoom(roomId);
        setCurrentUser(participant);
        setParticipants(roomParticipants);
        setMessages(roomMessages);
      });

      newSocket.on('user-joined', (data: any) => {
        console.log('👤 User joined:', data);
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

      newSocket.on('user-left', ({ participantId }) => {
        console.log('👋 User left:', participantId);
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      });

      newSocket.on('participants-updated', (updatedParticipants: any[]) => {
        console.log('👥 Participants updated:', updatedParticipants);
        const transformedParticipants: Participant[] = updatedParticipants.map(p => ({
          id: p.id,
          name: p.userName || p.name,
          avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userName || p.name}`,
          joinedAt: new Date(p.joinedAt),
          isVideoEnabled: !p.isVideoOff,
          isAudioEnabled: !p.isAudioMuted,
          isScreenSharing: p.isScreenSharing || false,
          isAdmin: p.isAdmin || false,
          canUseMic: p.canUseMic !== undefined ? p.canUseMic : true,
          canUseCamera: p.canUseCamera !== undefined ? p.canUseCamera : true,
          hasMicPermission: p.hasMicPermission !== undefined ? p.hasMicPermission : true,
          hasCameraPermission: p.hasCameraPermission !== undefined ? p.hasCameraPermission : true
        }));
        setParticipants(transformedParticipants);
        
        // Update current user if they are in the updated list
        const updatedCurrentUser = transformedParticipants.find(p => p.id === currentUser?.id);
        if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser);
        }
      });



      // Media toggle event handler
      newSocket.on('media-toggled', (data: any) => {
        console.log('🎬 Media toggled:', data);
        // Update participant state when media is toggled
        setParticipants(prev => prev.map(p => {
          if (p.id === data.participantId) {
            if (data.type === 'video') {
              return { ...p, isVideoEnabled: data.enabled };
            } else if (data.type === 'audio') {
              return { ...p, isAudioEnabled: data.enabled };
            }
          }
          return p;
        }));
      });

      // Chat event handlers
      newSocket.on('new-message', (message: any) => {
        // Transform backend message format to frontend format
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
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // App context value
  const contextValue: AppContextType = {
    socket,
    currentRoom,
    currentUser,
    participants,
    messages,
    isConnected
  };

  // Loading screen while establishing connection
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Home page - landing and room creation */}
            <Route path="/" element={<HomePage />} />
            
            {/* Join room page - enter room with user details */}
            <Route path="/join/:roomId?" element={<JoinRoom />} />
            
            {/* Meeting room - main video conference interface */}
            <Route 
              path="/room/:roomId" 
              element={
                currentRoom ? <MeetingRoom /> : <Navigate to="/" replace />
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;