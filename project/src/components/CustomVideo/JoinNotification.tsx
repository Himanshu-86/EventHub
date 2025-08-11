/**
 * JoinNotification Component
 * Shows notifications when participants join or leave the meeting
 */

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus } from 'lucide-react';

interface JoinNotificationProps {
  type: 'join' | 'leave';
  participantName: string;
  participantCount: number;
  onClose: () => void;
}

const JoinNotification: React.FC<JoinNotificationProps> = ({
  type,
  participantName,
  participantCount,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'join' ? 'bg-green-600' : 'bg-red-600'}`}>
            {type === 'join' ? (
              <UserPlus className="w-5 h-5" />
            ) : (
              <UserMinus className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="font-medium">
              {type === 'join' ? 'Joined' : 'Left'} the meeting
            </p>
            <p className="text-gray-300 text-sm">
              {participantName}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400 text-xs">
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinNotification;
