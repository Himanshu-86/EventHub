const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// Store active rooms and participants
const rooms = new Map();
const participants = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    totalParticipants: participants.size
  });
});

// Create room endpoint
app.post('/api/create-room', (req, res) => {
  try {
    const roomId = uuidv4().substring(0, 8).toUpperCase();
    
    // Create new room
    rooms.set(roomId, {
      id: roomId,
      participants: [],
      messages: [],
      createdAt: new Date().toISOString()
    });
    
    console.log(`Created new room: ${roomId}`);
    
    res.json({ 
      roomId,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room info endpoint
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    participantCount: room.participants.length,
    createdAt: room.createdAt
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle joining a room
  socket.on('join-room', ({ roomId, userName }) => {
    try {
      console.log(`User ${userName} (${socket.id}) joining room: ${roomId}`);
      
      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: [],
          messages: [],
          createdAt: new Date().toISOString()
        });
        console.log(`Created new room: ${roomId}`);
      }
      
      const room = rooms.get(roomId);
      
      // Add participant to room
                  const isFirstParticipant = room.participants.length === 0;
            const participant = {
              id: socket.id,
              name: userName,
              userName: userName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
              joinedAt: new Date().toISOString(),
              isAudioEnabled: true, // Everyone starts with audio enabled
              isVideoEnabled: true, // Everyone starts with video enabled
              isAudioMuted: false, // Everyone starts unmuted
              isVideoOff: false, // Everyone starts with video on
              isScreenSharing: false,
              isAdmin: isFirstParticipant,
              canUseMic: true, // Everyone can use mic
              canUseCamera: true, // Everyone can use camera
              hasMicPermission: true, // Everyone has mic permission
              hasCameraPermission: true // Everyone has camera permission
            };
      
      room.participants.push(participant);
      participants.set(socket.id, { roomId, userName });
      
      // Join socket room
      socket.join(roomId);
      
      // Notify user they've joined successfully
      socket.emit('joined-room', {
        roomId,
        participantId: socket.id,
        participant: participant,
        participants: room.participants,
        messages: room.messages
      });
      
      // Notify other participants about new user
      socket.to(roomId).emit('user-joined', {
        participantId: socket.id,
        userName,
        participant
      });
      
      console.log(`📢 Notified ${room.participants.length - 1} participants about new user: ${userName} (${socket.id})`);
      
      // Send updated participant list to all users in room
      io.to(roomId).emit('participants-updated', room.participants);
      
      console.log(`Room ${roomId} participants:`, room.participants.map(p => ({ id: p.id, name: p.name || p.userName })));
      console.log(`Room ${roomId} now has ${room.participants.length} participants`);
      
      console.log(`Room ${roomId} now has ${room.participants.length} participants`);
      
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Handle WebRTC signaling
  socket.on('webrtc-offer', ({ targetId, offer }) => {
    console.log(`📤 WebRTC offer from ${socket.id} to ${targetId}`);
    if (targetId) {
      socket.to(targetId).emit('webrtc-offer', {
        senderSocketId: socket.id,
        offer
      });
      console.log(`✅ WebRTC offer sent from ${socket.id} to ${targetId}`);
    } else {
      console.log('⚠️ Target ID is undefined for WebRTC offer');
    }
  });
  
  socket.on('webrtc-answer', ({ targetId, answer }) => {
    console.log(`WebRTC answer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      answer
    });
  });
  
  socket.on('webrtc-ice-candidate', ({ targetId, candidate }) => {
    console.log(`WebRTC ICE candidate from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('webrtc-ice-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });
  
  // Handle chat messages
  socket.on('send-message', (data) => {
    try {
      const { roomId, message, userName } = data || {};
      
      if (!roomId || !message) {
        console.error('Invalid message data:', data);
        return;
      }
      
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Get participant info if userName is not provided
      const participantInfo = participants.get(socket.id);
      const senderName = userName || participantInfo?.userName || 'Unknown User';
      
      const chatMessage = {
        id: uuidv4(),
        senderId: socket.id,
        userName: senderName,
        message,
        timestamp: new Date().toISOString()
      };
      
      room.messages.push(chatMessage);
      
      // Broadcast message to all participants in room
      io.to(roomId).emit('new-message', chatMessage);
      
      console.log(`Message in room ${roomId} from ${senderName}: ${message}`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle media state changes
  socket.on('toggle-audio', ({ roomId, isAudioEnabled }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        participant.isAudioEnabled = isAudioEnabled;
        participant.isAudioMuted = !isAudioEnabled;
        
        // Notify all participants about the change
        io.to(roomId).emit('participants-updated', room.participants);
        
        console.log(`User ${participant.name} ${isAudioEnabled ? 'enabled' : 'disabled'} audio`);
      }
    }
  });
  
  // Handle toggle media (video/audio)
  socket.on('toggle-media', ({ roomId, type, enabled }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        if (type === 'video') {
          participant.isVideoEnabled = enabled;
          participant.isVideoOff = !enabled;
          console.log(`User ${participant.name} ${enabled ? 'enabled' : 'disabled'} video`);
        } else if (type === 'audio') {
          participant.isAudioEnabled = enabled;
          participant.isAudioMuted = !enabled;
          console.log(`User ${participant.name} ${enabled ? 'enabled' : 'disabled'} audio`);
        }
        
        // Broadcast to all participants in room
        io.to(roomId).emit('participants-updated', room.participants);
        
        // Also emit specific media toggle event for real-time updates
        socket.to(roomId).emit('media-toggled', {
          participantId: socket.id,
          type: type,
          enabled: enabled,
          participantName: participant.name
        });
        
        // Log participant state for debugging
        console.log(`📊 Participant ${participant.name} state:`, {
          videoEnabled: participant.isVideoEnabled,
          audioEnabled: participant.isAudioEnabled,
          videoOff: participant.isVideoOff,
          audioMuted: participant.isAudioMuted
        });
      }
    }
  });
  
  // Handle connection request for bidirectional WebRTC
  socket.on('request-connection', ({ targetId, roomId }) => {
    console.log(`🔄 Connection request from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('connection-request', {
      senderId: socket.id,
      roomId: roomId
    });
  });

  // Handle screen sharing
  socket.on('start-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-started-screen-share', {
      participantId: socket.id
    });
  });
  
  socket.on('stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-screen-share', {
      participantId: socket.id
    });
  });


  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    const participantInfo = participants.get(socket.id);
    if (participantInfo) {
      const { roomId, userName } = participantInfo;
      const room = rooms.get(roomId);
      
      if (room) {
        // Remove participant from room
        room.participants = room.participants.filter(p => p.id !== socket.id);
        
        // Notify other participants
        socket.to(roomId).emit('user-left', {
          participantId: socket.id,
          userName
        });
        
        // Send updated participant list
        io.to(roomId).emit('participants-updated', room.participants);
        
        // Clean up empty rooms
        if (room.participants.length === 0) {
          rooms.delete(roomId);
          console.log(`Deleted empty room: ${roomId}`);
        } else {
          console.log(`Room ${roomId} now has ${room.participants.length} participants`);
        }
      }
      
      participants.delete(socket.id);
    }
  });
  
  // Handle explicit leave room
  socket.on('leave-room', ({ roomId }) => {
    const participantInfo = participants.get(socket.id);
    if (participantInfo && participantInfo.roomId === roomId) {
      socket.leave(roomId);
      socket.emit('left-room', { roomId });
    }
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 ProLiteMeet Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

module.exports = { app, server, io };