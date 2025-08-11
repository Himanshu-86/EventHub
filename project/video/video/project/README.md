# ProLiteMeet - Professional Video Conferencing App

A modern, real-time video conferencing application built with React, TypeScript, WebRTC, and Socket.IO.

## 🚀 Features

- **HD Video & Audio**: Crystal-clear video calls with adaptive quality
- **Multi-Participant Support**: Support for multiple participants with intelligent video grid layout
- **Real-time Chat**: Instant messaging with message history
- **Screen Sharing**: Share your screen, applications, or browser tabs
- **Secure & Private**: End-to-end encrypted communications
- **Cross-Platform**: Works on all devices and browsers

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Socket.IO Client for real-time communication
- WebRTC for peer-to-peer video/audio streaming

### Backend
- Node.js with Express
- Socket.IO for real-time bidirectional communication
- CORS enabled for cross-origin requests
- UUID for unique room and message IDs

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd video/project
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

## 🏃‍♂️ Running the Application

### Option 1: Using the startup script (Recommended)
   ```bash
./start.sh
   ```

### Option 2: Manual startup

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   # or
   node server.js
   ```

2. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── HomePage.tsx          # Landing page and room creation
│   │   ├── JoinRoom.tsx          # Room joining interface
│   │   ├── MeetingRoom.tsx       # Main video conference interface
│   │   ├── VideoGrid.tsx         # Video grid layout component
│   │   ├── ChatPanel.tsx         # Real-time chat interface
│   │   └── LoadingScreen.tsx     # Loading states
│   ├── utils/
│   │   └── WebRTCManager.ts      # WebRTC connection management
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── backend/
│   └── server.js                 # Express + Socket.IO server
├── start.sh                      # Startup script
└── package.json                  # Frontend dependencies
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Environment Variables

The application uses the following environment variables:

- `VITE_BACKEND_URL` - Backend server URL (default: http://localhost:3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `PORT` - Backend server port (default: 3001)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes using ports 3001 or 5173
   sudo lsof -ti:3001 | xargs kill -9
   sudo lsof -ti:5173 | xargs kill -9
   ```

2. **Camera/Microphone permissions**
   - Ensure your browser has permission to access camera and microphone
   - Check browser settings for media permissions

3. **WebRTC connection issues**
- Check firewall settings
   - Ensure STUN/TURN servers are accessible
   - Try using a different browser

### Linting Issues

If you encounter linting errors:
```bash
npm run lint
```

The project uses ESLint with TypeScript support. Most common issues are:
- Unused variables (prefix with `_` to ignore)
- Missing dependencies in useEffect hooks
- TypeScript type errors

## 📝 API Endpoints

### Backend API

- `GET /health` - Health check endpoint
- `GET /api/room/:roomId` - Get room information

### Socket.IO Events

#### Client to Server
- `join-room` - Join a video room
- `send-message` - Send chat message
- `toggle-audio` - Toggle audio mute
- `toggle-video` - Toggle video on/off
- `start-screen-share` - Start screen sharing
- `stop-screen-share` - Stop screen sharing
- `leave-room` - Leave the room

#### Server to Client
- `joined-room` - Confirmation of room join
- `user-joined` - New user joined notification
- `user-left` - User left notification
- `new-message` - New chat message
- `participants-updated` - Updated participant list

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React, WebRTC, and Socket.IO
- Icons from Lucide React
- Styling with Tailwind CSS