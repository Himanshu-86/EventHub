import { Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class WebRTCManager {
  private socket: Socket;
  private localId: string;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onRemoteStream: (participantId: string, stream: MediaStream) => void;
  private onParticipantLeft: (participantId: string) => void;

  constructor(
    socket: Socket,
    localId: string,
    onRemoteStream: (participantId: string, stream: MediaStream) => void,
    onParticipantLeft: (participantId: string) => void
  ) {
    this.socket = socket;
    this.localId = localId;
    this.onRemoteStream = onRemoteStream;
    this.onParticipantLeft = onParticipantLeft;

    this.socket.on('webrtc-signal', this.handleSignalingData);
  }

  public setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }

  public addTracksToAllPeers(stream: MediaStream) {
    this.setLocalStream(stream);
    for (const peerConnection of this.peerConnections.values()) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
    }
  }

  public createConnection = async (participantId: string) => {
    if (this.peerConnections.has(participantId)) {
      return;
    }

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(participantId, peerConnection);

    if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream!);
        });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-signal', {
          to: participantId,
          from: this.localId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      this.onRemoteStream(participantId, event.streams[0]);
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    this.socket.emit('webrtc-signal', {
      to: participantId,
      from: this.localId,
      offer: peerConnection.localDescription,
    });
  };

  public updateAudioTrack = (enabled: boolean) => {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  };

  public updateVideoTrack = (enabled: boolean) => {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  };

  public replaceVideoTrack = async (newTrack: MediaStreamTrack | null) => {
    for (const pc of this.peerConnections.values()) {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender && newTrack) {
        await sender.replaceTrack(newTrack);
      }
    }
  };

  public handleSignalingData = async (data: any) => {
    const { from, offer, answer, candidate } = data;
    let peerConnection = this.peerConnections.get(from);

    if (offer) {
      if (!peerConnection) {
        peerConnection = new RTCPeerConnection(ICE_SERVERS);
        this.peerConnections.set(from, peerConnection);

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection!.addTrack(track, this.localStream!);
            });
        }

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.socket.emit('webrtc-signal', {
              to: from,
              from: this.localId,
              candidate: event.candidate,
            });
          }
        };

        peerConnection.ontrack = (event) => {
          this.onRemoteStream(from, event.streams[0]);
        };
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit('webrtc-signal', { to: from, from: this.localId, answer });
    } else if (answer && peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } else if (candidate && peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  public closeConnection = (participantId: string) => {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
      this.onParticipantLeft(participantId);
    }
  };

  public closeAllConnections = () => {
    this.peerConnections.forEach((_, id) => {
      this.closeConnection(id);
    });
    this.socket.off('webrtc-signal', this.handleSignalingData);
  };
}

export default WebRTCManager;
