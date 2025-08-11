/**
 * PermissionNotification Component
 * Shows notifications when admin changes permissions
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, X } from 'lucide-react';

interface PermissionNotificationProps {
  type: 'mic-enabled' | 'mic-disabled' | 'camera-enabled' | 'camera-disabled';
  adminName: string;
  onClose: () => void;
}

const PermissionNotification: React.FC<PermissionNotificationProps> = ({
  type,
  adminName,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationContent = () => {
    switch (type) {
      case 'mic-enabled':
        return {
          icon: <Mic className="w-5 h-5 text-green-400" />,
          title: 'Microphone Enabled',
          message: `Admin ${adminName} enabled your microphone`,
          bgColor: 'bg-green-600',
          borderColor: 'border-green-500'
        };
      case 'mic-disabled':
        return {
          icon: <MicOff className="w-5 h-5 text-red-400" />,
          title: 'Microphone Disabled',
          message: `Admin ${adminName} disabled your microphone`,
          bgColor: 'bg-red-600',
          borderColor: 'border-red-500'
        };
      case 'camera-enabled':
        return {
          icon: <Video className="w-5 h-5 text-green-400" />,
          title: 'Camera Enabled',
          message: `Admin ${adminName} enabled your camera`,
          bgColor: 'bg-green-600',
          borderColor: 'border-green-500'
        };
      case 'camera-disabled':
        return {
          icon: <VideoOff className="w-5 h-5 text-red-400" />,
          title: 'Camera Disabled',
          message: `Admin ${adminName} disabled your camera`,
          bgColor: 'bg-red-600',
          borderColor: 'border-red-500'
        };
    }
  };

  const content = getNotificationContent();

  return (
    <div
      className={`fixed top-4 left-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className={`${content.bgColor} text-white rounded-lg shadow-lg border ${content.borderColor} p-4 max-w-sm`}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {content.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Crown className="w-4 h-4 text-yellow-300" />
              <p className="font-medium text-sm">
                {content.title}
              </p>
            </div>
            <p className="text-sm opacity-90">
              {content.message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionNotification; 