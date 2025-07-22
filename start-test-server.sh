#!/bin/bash

echo "🚀 Starting local test server for Job Application Extension..."
echo ""
echo "📂 Serving files from: $(pwd)"
echo "🌐 Access the test page at: http://localhost:8000/test-extension.html"
echo ""
echo "💡 Make sure your extension is installed and enabled in Chrome/Brave first!"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
python3 -m http.server 8000
