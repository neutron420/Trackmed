#!/bin/bash

echo "WebSocket Connection Test"
echo "========================="
echo ""
echo "Make sure your server is running: npm run dev"
echo ""
read -p "Enter JWT Token: " TOKEN

echo ""
echo "Connecting to ws://localhost:3000/ws..."
echo ""

# Using wscat if available, otherwise use node
if command -v wscat &> /dev/null; then
    echo "Using wscat..."
    echo '{"type":"AUTH","payload":{"token":"'$TOKEN'"}}' | wscat -c ws://localhost:3000/ws
else
    echo "wscat not found. Install it with: npm install -g wscat"
    echo "Or use the Node.js method below"
fi
