/**
 * WebRTCManager Class
 * Handles WebRTC peer-to-peer connections, signaling, and media streaming
 */

import { Socket } from 'socket.io-client';

export default class WebRTCManager {
  private socket: Socket;
  private roomId: string;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private configuration: RTCConfiguration;

  // Callbacks
  public onRemoteStream: ((participantId: string, stream: MediaStream) => void) | null = null;
  public onParticipantLeft: ((participantId: string) => void) | null = null;

  constructor(socket: Socket, roomId: string) {
    this.socket = socket;
    this.roomId = roomId;
    
    // STUN servers configuration for NAT traversal
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all'
    };

    this.setupSocketListeners();
  }

  /**
   * Set up Socket.IO event listeners for WebRTC signaling
   */
  private setupSocketListeners() {
    // Handle WebRTC offer
    this.socket.on('webrtc-offer', async ({ offer, senderSocketId }) => {
      console.log('📨 Received WebRTC offer from:', senderSocketId);
      await this.handleOffer(offer, senderSocketId);
    });

    // Handle WebRTC answer
    this.socket.on('webrtc-answer', async ({ answer, senderSocketId }) => {
      console.log('📨 Received WebRTC answer from:', senderSocketId);
      await this.handleAnswer(answer, senderSocketId);
    });

    // Handle ICE candidate
    this.socket.on('webrtc-ice-candidate', async ({ candidate, senderSocketId }) => {
      console.log('🧊 Received ICE candidate from:', senderSocketId);
      await this.handleIceCandidate(candidate, senderSocketId);
    });

    // Handle user joining (initiate bidirectional connection)
    this.socket.on('user-joined', (data) => {
      console.log('👤 User joined, creating bidirectional connection:', data.participantId);
      if (data.participantId) {
        // Create connection to the new user
        this.createConnection(data.participantId);
        
        // Also notify the new user to create connection back to us
        setTimeout(() => {
          console.log('🔄 Triggering bidirectional connection for:', data.participantId);
          this.socket.emit('request-connection', {
            targetId: data.participantId,
            roomId: this.roomId
          });
        }, 1000); // Small delay to ensure both sides are ready
      }
    });

    // Handle connection request from other users
    this.socket.on('connection-request', (data) => {
      console.log('🔄 Received connection request from:', data.senderId);
      if (data.senderId && !this.peerConnections.has(data.senderId)) {
        console.log('🔗 Creating connection back to:', data.senderId);
        this.createConnection(data.senderId);
      }
    });

    // Handle user leaving
    this.socket.on('user-left', ({ participantId }) => {
      console.log('👋 User left, cleaning up connection:', participantId);
      this.closeConnection(participantId);
      this.onParticipantLeft?.(participantId);
    });
  }

  /**
   * Set local media stream and add tracks to all peers
   */
  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    console.log('🎥 Local stream set');

    // Add tracks to all existing connections
    this.addTracksToAllPeers(stream);
  }

  /**
   * Add tracks to all peer connections
   */
  addTracksToAllPeers(localStream: MediaStream) {
    console.log('🔁 Adding tracks to all peers:', this.peerConnections.size, 'connections');
    
    if (!localStream) {
      console.error('❌ No local stream provided to addTracksToAllPeers');
      return;
    }
    
    const tracks = localStream.getTracks();
    console.log('🎯 Local stream tracks:', tracks.map(t => ({ kind: t.kind, enabled: t.enabled })));
    
    this.peerConnections.forEach((peerConnection, peerId) => {
      console.log('➕ Adding tracks to peer:', peerId);
      
      tracks.forEach(track => {
        console.log('🎯 Adding track:', track.kind, 'enabled:', track.enabled);
        try {
          peerConnection.addTrack(track, localStream);
          console.log('✅ Track added successfully to peer:', peerId);
        } catch (error) {
          console.error('❌ Error adding track to peer:', peerId, error);
        }
      });
    });
  }

  /**
   * Create peer connection for a participant
   */
  async createConnection(participantId: string) {
    if (!participantId) {
      console.error('❌ Cannot create connection: participantId is undefined');
      return;
    }
    
    if (this.peerConnections.has(participantId)) {
      console.log('⚠️ Connection already exists for:', participantId);
      return;
    }

    console.log('🔗 Creating new WebRTC connection for:', participantId);
    const peerConnection = new RTCPeerConnection(this.configuration);
    this.peerConnections.set(participantId, peerConnection);

    // Debug: Log connection creation
    console.log('🔗 Peer connection created:', {
      participantId,
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
      hasLocalStream: !!this.localStream
    });

    // Add local stream if available
    if (this.localStream) {
      console.log('🎥 Adding local stream to connection for:', participantId);
      this.addStreamToConnection(peerConnection, this.localStream);
    } else {
      console.warn('⚠️ No local stream available for connection to:', participantId);
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📺 Received remote stream from:', participantId, 'Tracks:', event.streams.length);
      const [remoteStream] = event.streams;
      if (remoteStream) {
        console.log('🎥 Remote stream tracks:', remoteStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
        
        // Monitor track changes
        remoteStream.getTracks().forEach(track => {
          track.onended = () => {
            console.log(`📺 Track ended for ${participantId}:`, track.kind);
            // Force re-render when track ends
            this.onRemoteStream?.(participantId, remoteStream);
          };
          track.onmute = () => {
            console.log(`📺 Track muted for ${participantId}:`, track.kind);
            // Force re-render when track is muted
            this.onRemoteStream?.(participantId, remoteStream);
          };
          track.onunmute = () => {
            console.log(`📺 Track unmuted for ${participantId}:`, track.kind);
            // Force re-render when track is unmuted
            this.onRemoteStream?.(participantId, remoteStream);
          };
        });
        
        this.onRemoteStream?.(participantId, remoteStream);
      } else {
        console.log('⚠️ No remote stream received from:', participantId);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (peerConnection && event.candidate) {
        console.log('🧊 Sending ICE candidate to:', participantId);
        this.socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          targetId: participantId,
          roomId: this.roomId
        });
      }
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${participantId}:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        console.log('✅ WebRTC connection established with:', participantId);
        // Force re-render when connection is established
        setTimeout(() => {
          this.onRemoteStream?.(participantId, new MediaStream());
        }, 100);
      } else if (peerConnection.connectionState === 'failed') {
        console.log('❌ Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      } else if (peerConnection.connectionState === 'disconnected') {
        console.log('⚠️ Connection disconnected with:', participantId);
      } else if (peerConnection.connectionState === 'connecting') {
        console.log('🔄 Connection connecting with:', participantId);
      } else if (peerConnection.connectionState === 'new') {
        console.log('🆕 New connection created with:', participantId);
      }
    };

    // Monitor ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection state with ${participantId}:`, peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'connected') {
        console.log('✅ ICE connection established with:', participantId);
        // Force re-render when ICE is connected
        setTimeout(() => {
          this.onRemoteStream?.(participantId, new MediaStream());
        }, 200);
      } else if (peerConnection.iceConnectionState === 'failed') {
        console.log('❌ ICE connection failed with:', participantId);
      } else if (peerConnection.iceConnectionState === 'checking') {
        console.log('🔍 ICE checking with:', participantId);
      } else if (peerConnection.iceConnectionState === 'completed') {
        console.log('✅ ICE completed with:', participantId);
      }
    };

    // Monitor ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection state with ${participantId}:`, peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'connected') {
        console.log('✅ ICE connection established with:', participantId);
      } else if (peerConnection.iceConnectionState === 'failed') {
        console.log('❌ ICE connection failed with:', participantId);
        // Try to restart ICE
        peerConnection.restartIce();
      } else if (peerConnection.iceConnectionState === 'checking') {
        console.log('🔍 ICE checking with:', participantId);
      } else if (peerConnection.iceConnectionState === 'completed') {
        console.log('✅ ICE completed with:', participantId);
      }
    };

    // Create and send offer
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      
      console.log('📤 Sending WebRTC offer to:', participantId);
      this.socket.emit('webrtc-offer', {
        offer,
        targetId: participantId,
        roomId: this.roomId
      });
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  /**
   * Handle incoming WebRTC offer
   */
  private async handleOffer(offer: RTCSessionDescriptionInit, senderSocketId: string) {
    let peerConnection = this.peerConnections.get(senderSocketId);
    
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection(this.configuration);
      this.peerConnections.set(senderSocketId, peerConnection);

      // Add local stream
      if (this.localStream) {
        this.addStreamToConnection(peerConnection, this.localStream);
      }

      // Handle remote stream with proper track management
      peerConnection.ontrack = (event) => {
        console.log('📺 Received remote stream from:', senderSocketId);
        console.log('📺 Event streams:', event.streams.length);
        console.log('📺 Event tracks:', event.track.kind, 'enabled:', event.track.enabled);
        console.log('📺 Event track readyState:', event.track.readyState);
        
        // Use the original stream from event if available
        let remoteStream: MediaStream;
        
        if (event.streams && event.streams.length > 0) {
          remoteStream = event.streams[0];
          console.log('📺 Using original stream, tracks:', remoteStream.getTracks().length);
          console.log('📺 Original stream tracks:', remoteStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
        } else {
          // Create new MediaStream if no streams in event
          remoteStream = new MediaStream();
          console.log('📺 Creating new stream, adding track:', event.track.kind);
          remoteStream.addTrack(event.track);
        }
        
        const tracks = remoteStream.getTracks();
        console.log('📺 Final remote stream tracks:', tracks.length);
        console.log('📺 Final stream tracks:', tracks.map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
        
        if (tracks.length > 0) {
          // Monitor track changes
          tracks.forEach(track => {
            track.onended = () => {
              console.log(`📺 Track ended for ${senderSocketId}:`, track.kind);
              this.onRemoteStream?.(senderSocketId, remoteStream);
            };
            track.onmute = () => {
              console.log(`📺 Track muted for ${senderSocketId}:`, track.kind);
              this.onRemoteStream?.(senderSocketId, remoteStream);
            };
            track.onunmute = () => {
              console.log(`📺 Track unmuted for ${senderSocketId}:`, track.kind);
              this.onRemoteStream?.(senderSocketId, remoteStream);
            };
          });
          
          // Call onRemoteStream immediately
          console.log('📺 Calling onRemoteStream for:', senderSocketId);
          this.onRemoteStream?.(senderSocketId, remoteStream);
          
          // Also call after a small delay to ensure UI updates
          setTimeout(() => {
            console.log('📺 Calling onRemoteStream again for:', senderSocketId);
            this.onRemoteStream?.(senderSocketId, remoteStream);
          }, 100);
        } else {
          console.error('❌ Remote stream has no tracks');
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (peerConnection && event.candidate) {
          console.log('🧊 Sending ICE candidate to:', senderSocketId);
          this.socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            targetId: senderSocketId,
            roomId: this.roomId
          });
        }
      };

      // Monitor connection state
      if (peerConnection) {
        peerConnection.onconnectionstatechange = () => {
          console.log(`🔗 Connection state with ${senderSocketId}:`, peerConnection.connectionState);
        };
      }
    }

    if (!peerConnection) {
      console.error('Peer connection not initialized for sender:', senderSocketId);
      return;
    }

    try {
      await peerConnection.setRemoteDescription(offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log('📤 Sending WebRTC answer to:', senderSocketId);
      this.socket.emit('webrtc-answer', {
        answer,
        targetId: senderSocketId,
        roomId: this.roomId,
      });

    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
    }
  }

  /**
   * Handle incoming WebRTC answer
   */
  private async handleAnswer(answer: RTCSessionDescriptionInit, senderSocketId: string) {
    const peerConnection = this.peerConnections.get(senderSocketId);
    
    if (!peerConnection) {
      console.error('❌ No peer connection found for:', senderSocketId);
      return;
    }

    try {
      await peerConnection.setRemoteDescription(answer);
      console.log('✅ WebRTC answer set for:', senderSocketId);
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(candidate: RTCIceCandidateInit, senderSocketId: string) {
    const peerConnection = this.peerConnections.get(senderSocketId);

    if (!peerConnection) {
      console.warn('⚠️ Peer connection not found for ICE candidate from:', senderSocketId);
      return;
    }

    if (!candidate) {
      console.warn('⚠️ Received an empty ICE candidate from:', senderSocketId);
      return;
    }

    try {
      await peerConnection.addIceCandidate(candidate);
      console.log('✅ ICE candidate added for:', senderSocketId);
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  /**
   * Add local stream to peer connection
   */
  private addStreamToConnection(peerConnection: RTCPeerConnection, stream: MediaStream) {
    const tracks = stream.getTracks();
    console.log('➕ Adding tracks to connection:', tracks.length, 'tracks');
    
    if (tracks.length === 0) {
      console.error('❌ No tracks to add to connection');
      return;
    }
    
    tracks.forEach(track => {
      console.log('➕ Adding track to connection:', track.kind, 'enabled:', track.enabled);
      peerConnection.addTrack(track, stream);
    });
  }

  /**
   * Replace video track (for screen sharing)
   */
  async replaceVideoTrack(newVideoTrack: MediaStreamTrack) {
    console.log('🔄 Replacing video track for all connections');
    
    this.peerConnections.forEach(async (peerConnection, participantId) => {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        try {
          await sender.replaceTrack(newVideoTrack);
          console.log('✅ Video track replaced for:', participantId);
        } catch (error) {
          console.error('❌ Error replacing video track for:', participantId, error);
        }
      }
    });

    // Update local stream
    if (this.localStream) {
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        this.localStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      this.localStream.addTrack(newVideoTrack);
    }
  }

  /**
   * Update video track enabled state for all peers
   */
  async updateVideoTrack(enabled: boolean) {
    console.log(`🎥 Updating video track state: ${enabled ? 'enabled' : 'disabled'}`);
    
    if (!this.localStream) {
      console.error('❌ No local stream available');
      return;
    }

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) {
      console.error('❌ No video track found');
      return;
    }

    // Update track enabled state
    videoTrack.enabled = enabled;
    console.log(`🎥 Video track ${enabled ? 'enabled' : 'disabled'}`);

    // Update all peer connections using replaceTrack
    this.peerConnections.forEach(async (peerConnection, participantId) => {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        try {
          // Replace the track with updated enabled state
          await sender.replaceTrack(videoTrack);
          console.log(`✅ Video track replaced for peer:`, participantId, 'enabled:', enabled);
        } catch (error) {
          console.error(`❌ Error replacing video track for peer:`, participantId, error);
          // Fallback: just update enabled state
          if (sender.track) {
            sender.track.enabled = enabled;
            console.log(`✅ Video track ${enabled ? 'enabled' : 'disabled'} for peer:`, participantId);
          }
        }
      }
    });
  }

  /**
   * Update audio track enabled state for all peers
   */
  async updateAudioTrack(enabled: boolean) {
    console.log(`🎤 Updating audio track state: ${enabled ? 'enabled' : 'disabled'}`);
    
    if (!this.localStream) {
      console.error('❌ No local stream available');
      return;
    }

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) {
      console.error('❌ No audio track found');
      return;
    }

    // Update track enabled state
    audioTrack.enabled = enabled;
    console.log(`🎤 Audio track ${enabled ? 'enabled' : 'disabled'}`);

    // Update all peer connections using replaceTrack
    this.peerConnections.forEach(async (peerConnection, participantId) => {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'audio'
      );
      
      if (sender) {
        try {
          // Replace the track with updated enabled state
          await sender.replaceTrack(audioTrack);
          console.log(`✅ Audio track replaced for peer:`, participantId, 'enabled:', enabled);
        } catch (error) {
          console.error(`❌ Error replacing audio track for peer:`, participantId, error);
          // Fallback: just update enabled state
          if (sender.track) {
            sender.track.enabled = enabled;
            console.log(`✅ Audio track ${enabled ? 'enabled' : 'disabled'} for peer:`, participantId);
          }
        }
      }
    });
  }

  /**
   * Close connection for a participant
   */
  public closeConnection(participantId: string) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
      console.log('🔒 Connection closed for:', participantId);
    }
  }

  public closeAllConnections() {
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peerConnections.clear();
  }

  /**
   * Clean up all connections
   */
  cleanup() {
    console.log('🧹 Cleaning up WebRTC connections');
    
    this.peerConnections.forEach((connection) => {
      connection.close();
    });
    
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Remove socket listeners
    this.socket.off('webrtc-offer');
    this.socket.off('webrtc-answer');
    this.socket.off('webrtc-ice-candidate');
    this.socket.off('user-joined');
    this.socket.off('user-left');
  }
}