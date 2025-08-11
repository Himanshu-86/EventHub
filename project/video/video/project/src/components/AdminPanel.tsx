/**
 * AdminPanel Component
 * Admin controls for managing participant permissions
 */

import React, { useContext } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown, Settings } from 'lucide-react';
import { AppContext, Participant } from '../App';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { socket, currentRoom, currentUser, participants } = useContext(AppContext);

  // Check if current user is admin
  const isAdmin = currentUser?.isAdmin;

  // Handle mic permission toggle
  const toggleMicPermission = (participant: Participant) => {
    if (!socket || !currentRoom || !isAdmin) return;

    socket.emit('admin-toggle-mic-permission', {
      roomId: currentRoom,
      participantId: participant.id,
      canUseMic: !participant.canUseMic
    });
  };

  // Handle camera permission toggle
  const toggleCameraPermission = (participant: Participant) => {
    if (!socket || !currentRoom || !isAdmin) return;

    socket.emit('admin-toggle-camera-permission', {
      roomId: currentRoom,
      participantId: participant.id,
      canUseCamera: !participant.canUseCamera
    });
  };

  if (!isAdmin) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Admin Panel</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Only room admin can access this panel</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Admin Controls</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="bg-gray-700 rounded-lg p-3"
          >
            {/* Participant Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium truncate">
                    {participant.name}
                  </span>
                  {participant.isAdmin && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                  {participant.id === currentUser?.id && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-gray-400 text-xs">Status:</span>
              <div className="flex items-center space-x-1">
                {participant.isAudioEnabled ? (
                  <Mic className="w-3 h-3 text-green-400" title="Mic ON" />
                ) : (
                  <MicOff className="w-3 h-3 text-red-400" title="Mic OFF" />
                )}
                {participant.isVideoEnabled ? (
                  <Video className="w-3 h-3 text-green-400" title="Camera ON" />
                ) : (
                  <VideoOff className="w-3 h-3 text-red-400" title="Camera OFF" />
                )}
              </div>
            </div>

            {/* Permission Controls */}
            {participant.id !== currentUser?.id && (
              <div className="space-y-2">
                {/* Mic Permission */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Microphone</span>
                  <button
                    onClick={() => toggleMicPermission(participant)}
                    className={`p-2 rounded transition-colors ${
                      participant.canUseMic 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title={participant.canUseMic ? 'Disable Mic' : 'Enable Mic'}
                  >
                    {participant.canUseMic ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MicOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Camera Permission */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Camera</span>
                  <button
                    onClick={() => toggleCameraPermission(participant)}
                    className={`p-2 rounded transition-colors ${
                      participant.canUseCamera 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title={participant.canUseCamera ? 'Disable Camera' : 'Enable Camera'}
                  >
                    {participant.canUseCamera ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <VideoOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm text-center">
          Admin controls for managing participant permissions
        </p>
      </div>
    </div>
  );
};

export default AdminPanel; 