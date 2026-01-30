#!/bin/bash

# Corporate Risk Assessment System - Start Script
# Runs Flask Backend and React Frontend concurrently

# Cleanup function to kill backend when script is stopped
cleanup() {
    echo ""
    echo "[System] Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

echo "============================================"
echo "Initializing Corporate Risk System"
echo "============================================"

# --- Backend Setup ---
echo "[Backend] Checking configuration..."
cd backend

# Create venv if missing
if [ ! -d ".venv" ]; then
    echo "   Creating virtual environment..."
    # Try uv first, then python3
    if command -v uv &> /dev/null; then
        uv venv --python 3.10
    else
        python3 -m venv .venv
    fi
fi

# Activate venv
source .venv/bin/activate

# Install dependencies
echo "   Installing Python dependencies..."
if command -v uv &> /dev/null; then
    uv pip install -r requirements.txt > /dev/null 2>&1
else
    pip install -r requirements.txt > /dev/null 2>&1
fi

# Start Backend in background
echo "[Backend] Starting Flask API on port 5000..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

cd ..

# --- Frontend Setup ---
echo "--------------------------------------------"
echo "[Frontend] Checking configuration..."
cd frontend

# Install node_modules if missing
if [ ! -d "node_modules" ]; then
    echo "   Installing NPM dependencies (this may take a minute)..."
    npm install > /dev/null 2>&1
fi

# Start Frontend
echo "[Frontend] Starting Vite Server..."
echo "   Application will be available at: http://localhost:3000"
echo "--------------------------------------------"
echo " Press Ctrl+C to stop the server"
echo "--------------------------------------------"

npm run dev

# Keep script running if npm run dev exits (unlikely unless error)
wait $BACKEND_PID
