#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

TOKEN=${1:-$JWT_TOKEN_USER}
MESSAGE=${2:-"Hello from chat!"}
RECIPIENT_ID=${3}

if [ -z "$TOKEN" ]; then
    echo "Usage: ./scripts/send-chat.sh [token] [message] [recipientId]"
    echo "Or set JWT_TOKEN_USER in .env file"
    exit 1
fi

echo "=========================================="
echo "Send Chat Message"
echo "=========================================="
echo ""

if [ -z "$RECIPIENT_ID" ]; then
    echo "Broadcast message: $MESSAGE"
else
    echo "Private message to $RECIPIENT_ID: $MESSAGE"
fi

echo ""

# Check if wscat is installed
if ! command -v wscat &> /dev/null; then
    echo "Error: wscat is not installed"
    echo "Install it with: npm install -g wscat"
    exit 1
fi

echo "Step 1: Authenticate (copy and paste this in wscat):"
echo '{"type":"AUTH","payload":{"token":"'$TOKEN'"}}'
echo ""

if [ -z "$RECIPIENT_ID" ]; then
    CHAT_MSG='{"type":"CHAT","payload":{"message":"'$MESSAGE'","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}'
else
    CHAT_MSG='{"type":"CHAT","payload":{"message":"'$MESSAGE'","recipientId":"'$RECIPIENT_ID'","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}'
fi

echo "Step 2: Send chat (copy and paste this in wscat):"
echo "$CHAT_MSG"
echo ""
echo "Connecting to WebSocket..."
wscat -c ws://localhost:3000/ws
