#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

TOKEN=${1:-$JWT_TOKEN_USER}
BATCH_ID=${2:-"batch-123"}
LAT=${3:-"28.6139"}
LNG=${4:-"77.2090"}
WAREHOUSE_ID=${5:-"warehouse-456"}

if [ -z "$TOKEN" ]; then
    echo "Usage: ./scripts/send-location.sh [token] [batchId] [lat] [lng] [warehouseId]"
    echo "Or set JWT_TOKEN_USER in .env file"
    exit 1
fi

echo "=========================================="
echo "Send Location Update"
echo "=========================================="
echo ""
echo "Batch ID: $BATCH_ID"
echo "Location: $LAT, $LNG"
echo "Warehouse: $WAREHOUSE_ID"
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
echo "Step 2: Send location (copy and paste this in wscat):"
LOCATION_MSG='{"type":"LOCATION","payload":{"batchId":"'$BATCH_ID'","warehouseId":"'$WAREHOUSE_ID'","lat":'$LAT',"lng":'$LNG',"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}'
echo "$LOCATION_MSG"
echo ""
echo "Connecting to WebSocket..."
wscat -c ws://localhost:3000/ws
