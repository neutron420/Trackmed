#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "=========================================="
echo "WebSocket Test Suite"
echo "=========================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "Error: Server is not running!"
    echo "Start it with: npm run dev"
    exit 1
fi

echo "Step 1: Testing MANUFACTURER connection..."
echo "----------------------------------------"
if [ -z "$JWT_TOKEN_USER" ]; then
    echo "Error: JWT_TOKEN_USER not set in .env"
    exit 1
fi
echo "Token: ${JWT_TOKEN_USER:0:50}..."
echo ""
echo "Command: npm run ws:test"
echo ""

echo "Step 2: Testing ADMIN connection..."
echo "----------------------------------------"
if [ -z "$JWT_TOKEN_ADMIN" ]; then
    echo "Error: JWT_TOKEN_ADMIN not set in .env"
    exit 1
fi
echo "Token: ${JWT_TOKEN_ADMIN:0:50}..."
echo ""
echo "Command: npm run test:chat-admin"
echo ""

echo "Step 3: Send location update..."
echo "----------------------------------------"
echo "Command: npm run send:location"
echo ""

echo "Step 4: Send chat message..."
echo "----------------------------------------"
echo "Command: npm run send:chat"
echo ""

echo "=========================================="
echo "Run these commands in separate terminals:"
echo "=========================================="
echo ""
echo "Terminal 1 (MANUFACTURER - receives chat):"
echo "  npm run ws:test"
echo ""
echo "Terminal 2 (ADMIN - sends chat):"
echo "  npm run test:chat-admin"
echo ""
echo "Terminal 3 (Send location):"
echo "  npm run send:location"
echo ""
