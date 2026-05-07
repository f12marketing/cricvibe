#!/bin/bash

# CricVibe Environment Setup Script
# Run this script to bootstrap the local development environment.

echo "🏏 Bootstrapping CricVibe Development Environment..."

# 1. Frontend Dependencies
echo ""
echo "📦 [1/3] Installing Frontend Dependencies..."
npm install

# 2. Backend Dependencies
echo ""
echo "📦 [2/3] Installing Cloud Functions Dependencies..."
cd functions
npm install
cd ..

# 3. Environment Variables Setup
echo ""
echo "⚙️ [3/3] Checking Environment Configurations..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example template."
    echo "⚠️  CRITICAL: You MUST open the .env file and paste your Firebase and RapidAPI credentials before proceeding."
  else
    echo "❌ Error: .env.example not found."
  fi
else
  echo "✅ .env file already exists."
fi

echo ""
echo "============================================================"
echo "🚀 Setup Complete!"
echo "To start the application, run: npm run dev"
echo "To test backend functions, run: cd functions && npm run serve"
echo "============================================================"
