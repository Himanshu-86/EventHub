import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './App'; // Assuming App.tsx will be in the same folder

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useContext(AppContext);
  const [roomId, setRoomId] = useState('');

  const createAndJoin = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/join/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      navigate(`/join/${roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">ProliteMeet</h1>
        <p className="text-lg text-gray-600 mt-2">Professional Video Conferencing</p>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <button
          onClick={createAndJoin}
          disabled={!isConnected}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 mb-4"
        >
          Create New Room
        </button>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder="Enter Room ID"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={joinRoom}
          disabled={!isConnected || !roomId}
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          Join Room
        </button>
        {!isConnected && <p className="text-red-500 text-sm mt-4 text-center">Connecting to server...</p>}
      </div>
    </div>
  );
};

export default HomePage;
