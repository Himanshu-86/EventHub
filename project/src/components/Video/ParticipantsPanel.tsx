/**
 * ParticipantsPanel Component
 * Shows all participants in the meeting with their avatars and status
 */

import React, { useContext } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { VideoContext, Participant } from './VideoContext';

interface ParticipantsPanelProps {
  onClose: () => void;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ onClose }) => {
  const { participants, currentUser } = useContext(VideoContext);

  // Format join time
  const formatJoinTime = (joinedAt: Date) => {
    return new Date(joinedAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Close participants panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {participants.map((participant: Participant) => (
          <div
            key={participant.id}
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={participant.avatar} 
                alt={participant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Participant Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium truncate">
                  {participant.name}
                </span>
                {currentUser && participant.id === currentUser.id && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-gray-400 text-xs">
                  Joined {formatJoinTime(participant.joinedAt)}
                </span>
              </div>
            </div>

            {/* Status Icons */}
            <div className="flex items-center space-x-1">
              {/* Audio Status */}
              {participant.isAudioEnabled ? (
                <Mic className="w-4 h-4 text-green-400" />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}

              {/* Video Status */}
              {participant.isVideoEnabled ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}

              {/* Screen Sharing Status */}
              {participant.isScreenSharing && (
                <Monitor className="w-4 h-4 text-blue-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm text-center">
          {participants.length} participant{participants.length !== 1 ? 's' : ''} in meeting
        </p>
      </div>
    </div>
  );
};

export default ParticipantsPanel; 