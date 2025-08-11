#!/bin/bash

echo "🚀 Starting ProLiteMeet Video Conferencing App..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping servers..."
    pkill -f "node server.js"
    pkill -f "vite"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server on port 3001..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started successfully!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 