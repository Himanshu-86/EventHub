/**
 * VideoGrid Component
 * Manages the layout and display of participant video streams
 */

import React from 'react';
import { MicOff, VideoOff, Monitor } from 'lucide-react';
import { Participant } from './types';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  currentUser: Participant;
  localVideoRef: React.RefObject<HTMLVideoElement>;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  remoteStreams,
  participants,
  currentUser
}) => {
  // Filter out current user from participants for remote video display
  const remoteParticipants = participants.filter(p => p.id !== currentUser.id);

  // Calculate grid layout based on participant count
  const getGridLayout = (count: number) => {
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3'; // Max 3 columns for larger groups
  };

  // Video component for individual participants
  const ParticipantVideo: React.FC<{ participant: Participant }> = ({ participant }) => {
    const stream = remoteStreams.get(participant.id);
    
    // Debug logging and stream validation
    React.useEffect(() => {
      if (stream) {
        const tracks = stream.getTracks();
        console.log(`🎥 Stream for ${participant.name}:`, {
          id: participant.id,
          tracks: tracks.map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })),
          videoEnabled: participant.isVideoEnabled,
          audioEnabled: participant.isAudioEnabled,
          trackCount: tracks.length
        });
        
        // Validate stream has tracks
        if (tracks.length === 0) {
          console.error(`❌ Stream for ${participant.name} has no tracks!`);
        } else {
          // Check if video track is enabled
          const videoTrack = tracks.find(t => t.kind === 'video');
          if (videoTrack) {
            console.log(`🎥 Video track for ${participant.name}:`, {
              enabled: videoTrack.enabled,
              readyState: videoTrack.readyState,
              muted: videoTrack.muted
            });
            
            // Check if video should be visible
            if (videoTrack.enabled && videoTrack.readyState === 'live') {
              console.log(`✅ Video should be visible for ${participant.name}`);
            } else {
              console.log(`❌ Video not ready for ${participant.name}:`, {
                enabled: videoTrack.enabled,
                readyState: videoTrack.readyState
              });
            }
          }
        }
      } else {
        console.log(`⚠️ No stream for ${participant.name} (${participant.id})`);
      }
    }, [stream, participant]);

    // Force re-render when participant state changes
    React.useEffect(() => {
      console.log(`🔄 Participant state changed for ${participant.name}:`, {
        videoEnabled: participant.isVideoEnabled,
        audioEnabled: participant.isAudioEnabled
      });
    }, [participant.isVideoEnabled, participant.isAudioEnabled, participant.name]);
    
    return (
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        {stream ? (
          <video
            ref={(video) => {
              if (video && stream) {
                // Ensure stream has tracks before setting srcObject
                const tracks = stream.getTracks();
                if (tracks.length > 0) {
                  // Set srcObject immediately
                  video.srcObject = stream;
                  console.log(`📺 Setting video srcObject for ${participant.name}, tracks:`, tracks.length);
                  
                  // Force video to load
                  video.load();
                  
                  video.onloadedmetadata = () => {
                    console.log(`📺 Video loaded for ${participant.name}, tracks:`, stream.getTracks().length);
                    // Force play after metadata is loaded
                    video.play().catch(e => console.log(`⚠️ Auto-play failed for ${participant.name}:`, e));
                  };
                  video.onerror = (e) => {
                    console.error(`❌ Video error for ${participant.name}:`, e);
                  };
                  video.onplay = () => {
                    console.log(`▶️ Video playing for ${participant.name}`);
                  };
                  video.onpause = () => {
                    console.log(`⏸️ Video paused for ${participant.name}`);
                  };
                  video.oncanplay = () => {
                    console.log(`🎬 Video can play for ${participant.name}`);
                  };
                  video.onwaiting = () => {
                    console.log(`⏳ Video waiting for ${participant.name}`);
                  };
                  video.onstalled = () => {
                    console.log(`⏸️ Video stalled for ${participant.name}`);
                  };
                } else {
                  console.error(`❌ No tracks in stream for ${participant.name}`);
                }
              }
            }}
            autoPlay
            playsInline
            muted={false}
            className={`w-full h-full object-cover ${participant.isVideoEnabled ? 'opacity-100' : 'opacity-30 grayscale'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="w-full h-full rounded-full"
                />
              </div>
              <p className="text-white text-sm font-medium">{participant.name}</p>
            </div>
          </div>
        )}

        {/* Participant name and status */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <div className="bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center space-x-1">
            <span>{participant.name}</span>
            {!participant.isAudioEnabled && <MicOff className="w-3 h-3" />}
            {participant.isScreenSharing && <Monitor className="w-3 h-3" />}
          </div>
        </div>

        {/* Video disabled overlay */}
        {!participant.isVideoEnabled && (
          <div className="absolute top-3 right-3">
            <VideoOff className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Audio muted indicator */}
        {!participant.isAudioEnabled && (
          <div className="absolute top-3 left-3">
            <div className="bg-red-600 p-1 rounded-full">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full p-4">
      {remoteParticipants.length === 0 ? (
        // No remote participants - show waiting message
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full rounded-full"
              />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Waiting for others to join...
            </h2>
            <p className="text-gray-400">
              Share the room ID with others to get started
            </p>
          </div>
        </div>
      ) : (
        // Display remote participants in grid
        <div className={`h-full grid ${getGridLayout(remoteParticipants.length)} gap-4 auto-rows-fr`}>
          {remoteParticipants.map((participant) => (
            <ParticipantVideo key={participant.id} participant={participant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
