#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

TOKEN=${1:-$JWT_TOKEN_ADMIN}
MESSAGE=${2:-"Hello MANUFACTURER!"}
RECIPIENT_ID=${3:-"user-123"}

if [ -z "$TOKEN" ]; then
    echo "Usage: ./scripts/test-chat-admin.sh [token] [message] [recipientId]"
    echo "Or set JWT_TOKEN_ADMIN in .env file"
    exit 1
fi

echo "=========================================="
echo "ADMIN Chat Test"
echo "=========================================="
echo ""
echo "Message: $MESSAGE"
echo "Recipient: $RECIPIENT_ID"
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
echo "Step 2: Send chat message (copy and paste this in wscat):"
CHAT_MSG='{"type":"CHAT","payload":{"message":"'$MESSAGE'","recipientId":"'$RECIPIENT_ID'","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}'
echo "$CHAT_MSG"
echo ""
echo "Connecting to WebSocket..."
wscat -c ws://localhost:3000/ws
