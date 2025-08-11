import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { VideoContext } from '../components/Video/VideoContext';

const ClassroomPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useContext(VideoContext);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = async () => {
    if (!isConnected) {
      alert('Not connected to server. Please try again.');
      return;
    }

    setIsCreatingRoom(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_VIDEO_BACKEND_URL || 'http://localhost:3001'}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const { roomId } = await response.json();
      navigate(`/join/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    navigate(`/join/${joinRoomId.trim().toUpperCase()}`);
  };

  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Classroom</h1>
        <p className="text-gray-600 mb-8">Create or join a video meeting.</p>

        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                onClick={handleCreateRoom}
                disabled={!isConnected || isCreatingRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold 
                            transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                            flex items-center justify-center space-x-2"
                >
                <Video className="w-5 h-5" />
                <span>{isCreatingRoom ? 'Creating Room...' : 'Create New Meeting'}</span>
                </button>

                <div className="flex">
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="border-2 border-gray-300 bg-white h-14 px-5 pr-16 rounded-lg text-sm focus:outline-none w-full"
                />
                <button
                    onClick={handleJoinRoom}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r-lg ml-[-10px]"
                >
                    Join
                </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ClassroomPage;
