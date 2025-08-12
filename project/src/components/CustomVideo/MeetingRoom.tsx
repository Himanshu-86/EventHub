/**
 * MeetingRoom Component
 * Main video conferencing interface with video grid, controls, and chat
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MessageCircle,
  Phone, Users, Copy, Check
} from 'lucide-react';
import { AppContext, Participant } from './types';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';
import JoinNotification from './JoinNotification';
import WebRTCManager from '../../utils/WebRTCManager';

const MeetingRoom: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [roomIdCopied, setRoomIdCopied] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'join' | 'leave';
    participantName: string;
    participantCount: number;
  }>>([]);

  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  if (!context) {
    useEffect(() => { navigate('/'); }, [navigate]);
    return null;
  }
  const { socket, currentRoom, currentUser, participants } = context;

  useEffect(() => {
    if (!socket || !currentUser || !currentRoom) {
      navigate('/');
      return;
    }

    const handleRemoteStream = (participantId: string, stream: MediaStream) => {
      setRemoteStreams(prev => new Map(prev).set(participantId, stream));
    };

    const handleParticipantLeft = (participantId: string) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(participantId);
        return newMap;
      });
    };

    webRTCManagerRef.current = new WebRTCManager(socket, currentUser.id, handleRemoteStream, handleParticipantLeft);

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        webRTCManagerRef.current?.setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        participants.forEach((p: Participant) => {
          if (p.id !== currentUser.id) {
            webRTCManagerRef.current?.createConnection(p.id);
          }
        });
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    initMedia();

    const handleUserJoined = (data: { userName: string, participantId: string }) => {
      addNotification('join', data.userName);
      webRTCManagerRef.current?.createConnection(data.participantId);
    };

    const handleUserLeft = (data: { userName: string }) => {
      addNotification('leave', data.userName);
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      webRTCManagerRef.current?.closeAllConnections();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [socket, currentRoom, currentUser, participants, navigate]);

  const addNotification = (type: 'join' | 'leave', participantName: string) => {
    const id = `${Date.now()}`;
    setNotifications(prev => [...prev, { id, type, participantName, participantCount: participants.length + 1 }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const toggleAudio = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      webRTCManagerRef.current?.updateAudioTrack(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      webRTCManagerRef.current?.updateVideoTrack(videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      setLocalStream(stream);
      webRTCManagerRef.current?.replaceVideoTrack(videoTrack);
      setIsScreenSharing(false);
    } else {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = stream.getVideoTracks()[0];
      setLocalStream(stream);
      webRTCManagerRef.current?.replaceVideoTrack(screenTrack);
      setIsScreenSharing(true);
      screenTrack.onended = () => toggleScreenShare();
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom });
    }
    navigate('/');
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setRoomIdCopied(true);
      setTimeout(() => setRoomIdCopied(false), 2000);
    }
  };

  if (!currentUser || !currentRoom) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Room: {currentRoom}</h1>
          <button onClick={copyRoomId} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center">
              {roomIdCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              <span className="ml-2">{roomIdCopied ? 'Copied!' : 'Copy Room ID'}</span>
          </button>
        </header>
        <main className="flex-1 relative p-4">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            currentUser={currentUser}
            localVideoRef={localVideoRef}
          />
          <div className="absolute top-4 right-4 z-20 space-y-2">
            {notifications.map(n => (
              <JoinNotification key={n.id} {...n} onClose={() => setNotifications(prev => prev.filter(i => i.id !== n.id))} />
            ))}
          </div>
        </main>
        <footer className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-4">
          <button onClick={toggleAudio} title={isAudioEnabled ? 'Mute' : 'Unmute'} className={`p-3 rounded-full ${isAudioEnabled ? 'bg-blue-500' : 'bg-red-500'}`}>{isAudioEnabled ? <Mic /> : <MicOff />}</button>
          <button onClick={toggleVideo} title={isVideoEnabled ? 'Camera Off' : 'Camera On'} className={`p-3 rounded-full ${isVideoEnabled ? 'bg-blue-500' : 'bg-red-500'}`}>{isVideoEnabled ? <Video /> : <VideoOff />}</button>
          <button onClick={toggleScreenShare} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'} className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-500' : 'bg-gray-600'}`}>
            <Monitor />
          </button>
          <button onClick={() => setIsChatOpen(!isChatOpen)} title="Chat"><MessageCircle /></button>
          <button onClick={() => setShowParticipants(!showParticipants)} title="Participants"><Users /></button>
          <button onClick={leaveRoom} title="Leave Call" className="p-3 rounded-full bg-red-600 hover:bg-red-700"><Phone /></button>
        </footer>
      </div>
      {isChatOpen && <ChatPanel onClose={() => setIsChatOpen(false)} />}
      {showParticipants && <ParticipantsPanel onClose={() => setShowParticipants(false)} />}
    </div>
  );
};

export default MeetingRoom;
