/**
 * MeetingRoom Component
 * Main video conferencing interface with video grid, controls, and chat
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, 
  Phone, Users, Settings, Copy, Check, Crown
} from 'lucide-react';
import { AppContext } from '../App';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';

import JoinNotification from './JoinNotification';
import WebRTCManager from '../utils/WebRTCManager';

const MeetingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { socket, currentRoom, currentUser, participants, isConnected } = useContext(AppContext);

  // Media states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [roomIdCopied, setRoomIdCopied] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'join' | 'leave';
    participantName: string;
    participantCount: number;
  }>>([]);

  // Refs
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize WebRTC and get user media
  useEffect(() => {
    if (!socket || !currentRoom || !currentUser) {
      navigate('/');
      return;
    }

    initializeMedia();
    setupWebRTC();

    // Add socket event listeners for notifications
    const handleUserJoined = (data: any) => {
      if (data.userName && data.userName !== currentUser.name) {
        addNotification('join', data.userName);
        
        // Create WebRTC connection to the new user
        if (webRTCManagerRef.current && data.participantId && localStream) {
          console.log('🔗 Creating connection to new user:', data.userName, data.participantId);
          webRTCManagerRef.current.createConnection(data.participantId);
        }
      }
    };

    const handleUserLeft = (data: any) => {
      if (data.userName && data.userName !== currentUser.name) {
        addNotification('leave', data.userName);
      }
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      cleanup();
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, currentRoom, currentUser]);

  // Initialize user media (camera and microphone)
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Validate that we got tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      console.log('📹 Video tracks received:', videoTracks.length);
      console.log('🎤 Audio tracks received:', audioTracks.length);
      
      if (videoTracks.length === 0 && audioTracks.length === 0) {
        throw new Error('No video or audio tracks received from getUserMedia');
      }

      setLocalStream(stream);
      
      // Add tracks to all existing peer connections
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.addTracksToAllPeers(stream);
      }
      
      // Set initial states based on actual track states
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        console.log('🎥 Initial video track state:', videoTrack.enabled);
        
        // Monitor video track state changes
        videoTrack.onended = () => {
          console.log('🎥 Video track ended');
          setIsVideoEnabled(false);
        };
        videoTrack.onmute = () => {
          console.log('🎥 Video track muted');
          setIsVideoEnabled(false);
        };
        videoTrack.onunmute = () => {
          console.log('🎥 Video track unmuted');
          setIsVideoEnabled(true);
        };
      }
      
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        console.log('🎤 Initial audio track state:', audioTrack.enabled);
        
        // Monitor audio track state changes
        audioTrack.onended = () => {
          console.log('🎤 Audio track ended');
          setIsAudioEnabled(false);
        };
        audioTrack.onmute = () => {
          console.log('🎤 Audio track muted');
          setIsAudioEnabled(false);
        };
        audioTrack.onunmute = () => {
          console.log('🎤 Audio track unmuted');
          setIsAudioEnabled(true);
        };
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Local media initialized');
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      alert('Unable to access camera or microphone. Please check permissions.');
    }
  };

  // Setup WebRTC manager
  const setupWebRTC = () => {
    if (!socket || !currentRoom) return;

    webRTCManagerRef.current = new WebRTCManager(socket, currentRoom);
    
    // Handle remote streams
    webRTCManagerRef.current.onRemoteStream = (participantId: string, stream: MediaStream) => {
      console.log('📺 Received remote stream from:', participantId, 'Tracks:', stream.getTracks().length);
      
      // Find participant name for logging
      const participant = participants.find(p => p.id === participantId);
      const participantName = participant?.name || participantId;
      console.log(`🎥 Stream from ${participantName} (${participantId}):`, stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
      
      // Validate stream has tracks
      const tracks = stream.getTracks();
      if (tracks.length === 0) {
        console.error(`❌ Stream from ${participantName} has no tracks!`);
        return;
      }
      
      // Check if video track is enabled
      const videoTrack = tracks.find(t => t.kind === 'video');
      if (videoTrack) {
        console.log(`🎥 Video track for ${participantName}:`, {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted
        });
      }
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(participantId, stream);
        console.log('📊 Total remote streams:', newMap.size, 'Participants:', Array.from(newMap.keys()));
        return newMap;
      });
      
      // Force re-render after a small delay
      setTimeout(() => {
        setRemoteStreams(prev => new Map(prev));
      }, 50);
    };

    // Handle participant leaving
    webRTCManagerRef.current.onParticipantLeft = (participantId: string) => {
      console.log('👋 Participant left:', participantId);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(participantId);
        return newMap;
      });
    };
  };

  // Add notification
  const addNotification = (type: 'join' | 'leave', participantName: string) => {
    const notificationId = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, {
      id: notificationId,
      type,
      participantName,
      participantCount: participants.length
    }]);
  };

  // Remove notification
  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Add local stream to WebRTC connections
  useEffect(() => {
    if (localStream && webRTCManagerRef.current) {
      webRTCManagerRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  // Handle new participants joining with bidirectional connections
  useEffect(() => {
    if (webRTCManagerRef.current && participants.length > 0 && localStream && currentUser?.id) {
      console.log('🔄 Creating bidirectional WebRTC connections for participants:', participants.length);
      console.log('👤 Current user ID:', currentUser.id);
      console.log('👥 All participants:', participants.map(p => ({ id: p.id, name: p.name })));
      
      // Create connections for new participants
      participants.forEach(participant => {
        if (participant.id && participant.id !== currentUser.id && !remoteStreams.has(participant.id)) {
          console.log('🔗 Creating bidirectional connection for participant:', participant.name, participant.id);
          
          // Create connection to this participant
          webRTCManagerRef.current?.createConnection(participant.id);
          
          // Also request them to create connection back to us
          setTimeout(() => {
            if (socket && currentRoom) {
              console.log('🔄 Requesting connection back from:', participant.name, participant.id);
              socket.emit('request-connection', {
                targetId: participant.id,
                roomId: currentRoom
              });
            }
          }, 500);
        } else if (!participant.id) {
          console.log('⚠️ Participant without ID:', participant);
        } else if (remoteStreams.has(participant.id)) {
          console.log('✅ Connection already exists for:', participant.name, participant.id);
        }
      });
    }
  }, [participants, currentUser, remoteStreams, localStream, socket, currentRoom]);

  // Toggle video
  const toggleVideo = () => {
    if (!localStream || !webRTCManagerRef.current) return;

    try {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const newVideoState = !videoTrack.enabled;
        
        // Update track in WebRTC manager (updates all peers)
        webRTCManagerRef.current.updateVideoTrack(newVideoState);
        
        // Update local state
        setIsVideoEnabled(newVideoState);
        
        // Broadcast to all participants via socket
        if (socket && currentRoom) {
          socket.emit('toggle-media', {
            type: 'video',
            enabled: newVideoState,
            roomId: currentRoom
          });
        }
        
        console.log(`🎥 Video ${newVideoState ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (!localStream || !webRTCManagerRef.current) return;

    try {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const newAudioState = !audioTrack.enabled;
        
        // Update track in WebRTC manager (updates all peers)
        webRTCManagerRef.current.updateAudioTrack(newAudioState);
        
        // Update local state
        setIsAudioEnabled(newAudioState);
        
        // Broadcast to all participants via socket
        if (socket && currentRoom) {
          socket.emit('toggle-media', {
            type: 'audio',
            enabled: newAudioState,
            roomId: currentRoom
          });
        }
        
        console.log(`🎤 Audio ${newAudioState ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing with better permissions
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor",
            logicalSurface: true,
            resizeMode: "crop-and-scale"
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          },
          selfBrowserSurface: "include",
          systemAudio: "include"
        });

        // Replace video track in all peer connections
        if (webRTCManagerRef.current && localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          webRTCManagerRef.current.replaceVideoTrack(videoTrack);
          
          // Update local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }

          // Handle screen share end
          videoTrack.onended = () => {
            stopScreenShare();
          };

          setIsScreenSharing(true);
          
          // Notify other participants
          if (socket && currentRoom) {
            socket.emit('start-screen-share', {
              roomId: currentRoom
            });
          }
        }
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      if (error.name === 'NotAllowedError') {
        alert('Screen sharing permission denied. Please allow screen sharing and try again.');
      } else {
        alert('Unable to share screen. Please try again.');
      }
    }
  };

  // Stop screen sharing
  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false // Keep original audio track
      });

      // Replace screen share track with camera track
      if (webRTCManagerRef.current && localStream) {
        const videoTrack = cameraStream.getVideoTracks()[0];
        webRTCManagerRef.current.replaceVideoTrack(videoTrack);
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  // Leave meeting
  const leaveMeeting = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    cleanup();
    navigate('/');
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setRoomIdCopied(true);
      setTimeout(() => setRoomIdCopied(false), 2000);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.cleanup();
    }
  };

  // Don't render if not properly connected to room
  if (!currentRoom || !currentUser) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">ProLiteMeet</h1>
          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
            <span className="text-gray-300 text-sm">Room: {currentRoom}</span>
            <button
              onClick={copyRoomId}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Copy Room ID"
            >
              {roomIdCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Participants count */}
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">{participants.length}</span>
          </button>



          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            currentUser={currentUser}
            localVideoRef={localVideoRef}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
          />

          {/* Local video in corner */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {currentUser.name} (You)
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 border-l border-gray-700">
            <ChatPanel onClose={() => setIsChatOpen(false)} />
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-80 border-l border-gray-700">
            <ParticipantsPanel onClose={() => setShowParticipants(false)} />
          </div>
        )}


      </div>

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <div key={notification.id} style={{ top: `${4 + index * 5}rem` }}>
          <JoinNotification
            type={notification.type}
            participantName={notification.participantName}
            participantCount={notification.participantCount}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}

      {/* Controls Bar */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-4 border-t border-gray-700">
        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-all ${
            isAudioEnabled 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all ${
            isVideoEnabled 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-all ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor className="w-6 h-6" />
        </button>

        {/* Chat Toggle */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3 rounded-full transition-all ${
            isChatOpen 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title="Toggle chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Leave Meeting */}
        <button
          onClick={leaveMeeting}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all ml-8"
          title="Leave meeting"
        >
          <Phone className="w-6 h-6 transform rotate-135" />
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-20 left-4 bg-red-600 text-white px-4 py-2 rounded-lg">
          Connection lost. Trying to reconnect...
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;