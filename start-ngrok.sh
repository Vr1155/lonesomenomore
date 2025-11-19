#!/bin/bash

echo "🔗 Starting ngrok tunnel..."
echo "📍 Exposing http://localhost:3001"
echo ""
echo "To get your ngrok URL:"
echo "1. Open another terminal"
echo "2. Run: curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'"
echo ""
echo "Or visit: http://localhost:4040"
echo ""

ngrok http 3001
