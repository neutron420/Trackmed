#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

TOKEN=${1:-$JWT_TOKEN_USER}

if [ -z "$TOKEN" ]; then
    echo "Usage: ./scripts/test-ws.sh [jwt_token]"
    echo "Or set JWT_TOKEN_USER in .env file"
    exit 1
fi

echo "=========================================="
echo "WebSocket Connection Test"
echo "=========================================="
echo ""
echo "Connecting to ws://localhost:3000/ws..."
echo ""

# Check if wscat is installed
if ! command -v wscat &> /dev/null; then
    echo "Error: wscat is not installed"
    echo "Install it with: npm install -g wscat"
    exit 1
fi

echo "Using wscat..."
echo ""
echo "Step 1: Send this AUTH message:"
echo '{"type":"AUTH","payload":{"token":"'$TOKEN'"}}'
echo ""
echo "Step 2: After authentication, you can send LOCATION or CHAT messages"
echo ""
echo "Connecting... (Type messages manually or Ctrl+C to exit)"
wscat -c ws://localhost:3000/ws
