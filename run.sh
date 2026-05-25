#!/usr/bin/env bash
# ------------------------------------------------------------
# One‑click launch script for the Aasha AI learning platform
# ------------------------------------------------------------
# Usage:   ./run.sh
# This script starts the FastAPI backend and the Vite/Next.js frontend.
# It works in Git‑bash, WSL, or any POSIX‑compatible shell on Windows.

# Exit on any error
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# ---------- Backend ----------
echo "Starting FastAPI backend..."
cd "$BASE_DIR/backend"
# Activate virtual environment if present
if [ -d ".venv" ]; then
  source .venv/Scripts/activate
fi
# Install dependencies (idempotent)
python -m pip install -r requirements.txt > /dev/null
# Start FastAPI (background) – will auto‑reload on changes
# Note: main app lives in main.py
uvicorn main:app --reload &
BACKEND_PID=$!

# ---------- Frontend ----------
echo "Starting frontend (Vite/Next)..."
cd "$BASE_DIR/frontend"
# Install npm deps if missing
if [ ! -d "node_modules" ]; then
  npm install
fi
# Run dev server (foreground) – you can stop with Ctrl‑C which will also kill backend
npm run dev

# When the frontend exits, terminate the backend process
echo "Shutting down backend..."
kill $BACKEND_PID
