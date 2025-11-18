#!/bin/bash

# Safe server restart script
echo "🔄 Stopping existing servers..."

# Kill processes on ports 3000 and 4000
lsof -ti :3000 -ti :4000 | xargs -r kill -9 2>/dev/null

# Wait for ports to be fully released
sleep 2

echo "✅ Ports cleared"
echo ""
echo "🚀 Starting backend server..."

# Start backend in background
cd "$(dirname "$0")/backend" && npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Check if backend is running
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend is running on port 4000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo ""
echo "🚀 Starting frontend server..."

# Start frontend
cd "$(dirname "$0")/frontend" && npm start

# When frontend exits (Ctrl+C), cleanup backend
echo ""
echo "🛑 Shutting down servers..."
kill $BACKEND_PID 2>/dev/null
lsof -ti :3000 -ti :4000 | xargs -r kill -9 2>/dev/null
echo "✅ Servers stopped"
