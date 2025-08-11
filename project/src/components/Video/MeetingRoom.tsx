import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, 
  Phone, Users, Copy, Check
} from 'lucide-react';
import { VideoContext } from './VideoContext';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';
import JoinNotification from './JoinNotification';
import WebRTCManager from './utils/WebRTCManager';

const MeetingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { socket, currentRoom, currentUser, participants, isConnected } = useContext(VideoContext);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [roomIdCopied, setRoomIdCopied] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'join' | 'leave'; participantName: string; }>>([]);

  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!socket || !currentRoom || !currentUser) {
      navigate('/');
      return;
    }

    initializeMedia();
    setupWebRTC();

    const handleUserJoined = (data: { userName: string; participantId: string; }) => {
      if (data.userName && data.userName !== currentUser.name) {
        addNotification('join', data.userName);
        if (webRTCManagerRef.current && data.participantId && localStream) {
          webRTCManagerRef.current.createConnection(data.participantId);
        }
      }
    };

    const handleUserLeft = (data: { userName: string; }) => {
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

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.addTracksToAllPeers(stream);
      }
    } catch (error) {
      console.error('Error initializing media:', error);
      alert('Could not access camera and microphone.');
    }
  };

  const setupWebRTC = () => {
    if (socket && currentUser) {
      webRTCManagerRef.current = new WebRTCManager(socket, currentUser.id);

      webRTCManagerRef.current.onRemoteStream = (participantId, stream) => {
        setRemoteStreams(prev => new Map(prev).set(participantId, stream));
      };

      webRTCManagerRef.current.onParticipantLeft = (participantId) => {
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(participantId);
          return newStreams;
        });
      };
    }
  };

  const addNotification = (type: 'join' | 'leave', participantName: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, participantName }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleMediaTrack = (type: 'video' | 'audio') => {
    if (localStream) {
      const track = type === 'video' ? localStream.getVideoTracks()[0] : localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        if (type === 'video') setIsVideoEnabled(track.enabled);
        if (type === 'audio') setIsAudioEnabled(track.enabled);
      }
    }
  };

  const toggleVideo = () => toggleMediaTrack('video');
  const toggleAudio = () => toggleMediaTrack('audio');

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const screenTrack = stream.getVideoTracks()[0];

        if (webRTCManagerRef.current) {
          webRTCManagerRef.current.replaceVideoTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (error: any) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const stopScreenShare = () => {
    if (localStream && webRTCManagerRef.current) {
      const videoTrack = localStream.getVideoTracks()[0];
      webRTCManagerRef.current.replaceVideoTrack(videoTrack);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      setIsScreenSharing(false);
    }
  };

  const leaveMeeting = () => {
    cleanup();
    navigate('/');
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setRoomIdCopied(true);
      setTimeout(() => setRoomIdCopied(false), 2000);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.closeAllConnections();
    }
    if (socket && currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex flex-col flex-1">
        <div className="flex-1 relative p-4">
          {currentUser && <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            currentUser={currentUser}
            localVideoRef={localVideoRef}
          />}
        </div>

        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{currentRoom}</span>
            <button onClick={copyRoomId} title="Copy Room ID" className="p-2 rounded-full hover:bg-gray-700">
              {roomIdCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={toggleAudio} title={isAudioEnabled ? 'Mute' : 'Unmute'} className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'}`}>
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button onClick={toggleVideo} title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'} className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'}`}>
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button onClick={toggleScreenShare} title={isScreenSharing ? 'Stop sharing' : 'Share screen'} className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <Monitor className="w-6 h-6" />
            </button>
            <button onClick={leaveMeeting} title="Leave meeting" className="p-3 rounded-full bg-red-600 ml-8">
              <Phone className="w-6 h-6 transform rotate-135" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setShowParticipants(!showParticipants)} title="Show participants" className="p-3 rounded-full bg-gray-700 relative">
              <Users className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full px-1.5">{participants.length}</span>
            </button>
            <button onClick={() => setIsChatOpen(!isChatOpen)} title="Toggle chat" className="p-3 rounded-full bg-gray-700">
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {isChatOpen && <ChatPanel onClose={() => setIsChatOpen(false)} />}
      {showParticipants && <ParticipantsPanel onClose={() => setShowParticipants(false)} />}

      <div className="absolute top-4 right-4 space-y-2">
        {notifications.map(n => (
          <JoinNotification key={n.id} type={n.type} participantName={n.participantName} participantCount={participants.length} onClose={() => removeNotification(n.id)} />
        ))}
      </div>

      {!isConnected && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg">
          Connection lost. Reconnecting...
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
