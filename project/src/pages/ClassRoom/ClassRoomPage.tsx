import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { AppContext, Participant, ChatMessage } from '../../components/CustomVideo/types';
import MeetingRoom from '../../components/CustomVideo/MeetingRoom';
import { useAuth } from '../../hooks/useAuth';

const ClassRoomPage: React.FC = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Ensure this URL points to your signaling server
    const newSocket = io('http://localhost:3001'); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    newSocket.on('update-participants', (participantList: Participant[]) => {
      setParticipants(participantList);
    });

    newSocket.on('new-message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoinRoom = (roomId: string) => {
    if (socket && user) {
      const currentUser: Participant = {
        id: user.id,
        name: user.name,
        avatar: user.avatar || '',
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
        isHost: false, 
        joinedAt: new Date(),
      };
      socket.emit('join-room', { roomId, user: currentUser });
      setCurrentRoom(roomId);
      setParticipants([currentUser]);
    }
  };

  const [roomName, setRoomName] = useState('');

  if (!user) {
    return <div className="flex items-center justify-center h-screen"><p>Loading user information...</p></div>;
  }

  const currentUser: Participant = {
    id: user.id,
    name: user.name,
    avatar: user.avatar || '',
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    isHost: false,
    joinedAt: new Date(),
  };

  return (
    <AppContext.Provider value={{ socket, isConnected, currentUser, currentRoom, participants, setParticipants, messages, setMessages }}>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Class Room</h1>
          {!currentRoom ? (
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-6">Join or Create a Room</h2>
              <input
                type="text"
                placeholder="Enter Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleJoinRoom(roomName)}
                disabled={!roomName || !isConnected}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isConnected ? 'Join / Create Room' : 'Connecting...'}
              </button>
            </div>
          ) : (
            <MeetingRoom />
          )}
        </div>
      </DashboardLayout>
    </AppContext.Provider>
  );
};

export default ClassRoomPage;
