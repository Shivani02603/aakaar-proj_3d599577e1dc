#!/bin/bash
set -e
# Start backend in background
cd backend && npm start &
BACKEND_PID=$!
# Start frontend dev server
cd ../frontend && npm run dev
# Wait for backend to finish (should not happen unless backend exits)
wait $BACKEND_PID