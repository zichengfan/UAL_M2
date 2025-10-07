#!/bin/bash

# UAL M2 Enhanced Memory Map - Setup and Start Script

echo "=== UAL M2 Enhanced Memory Map Setup ==="
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 to continue."
    exit 1
fi

echo "✅ Python 3 found"

# Check if data directory exists
if [ ! -d "data/users" ] || [ ! -d "data/memories" ]; then
    echo "📁 Creating data directories..."
    mkdir -p data/users data/memories
    echo "✅ Data directories created"
else
    echo "✅ Data directories exist"
fi

# Function to start the server
start_server() {
    echo
    echo "🚀 Starting UAL M2 User Data Server..."
    echo "📊 Data will be saved to: $(pwd)/data/users/"
    echo "🌐 Server will run at: http://localhost:3001"
    echo
    echo "Press Ctrl+C to stop the server"
    echo "============================================"
    
    cd "$(dirname "$0")"
    python3 scripts/user-data-server.py
}

# Function to open the application
open_app() {
    echo
    echo "🌐 Opening UAL M2 Enhanced Memory Map..."
    echo "📍 Application URL: http://localhost:8000/enhanced-index.html"
    
    # Try to open in default browser (works on most systems)
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8000/enhanced-index.html"
    elif command -v open &> /dev/null; then
        open "http://localhost:8000/enhanced-index.html"
    else
        echo "Please open http://localhost:8000/enhanced-index.html in your browser"
    fi
}

# Main menu
echo "Choose an option:"
echo "1) Start User Data Server (Required for file storage)"
echo "2) Start Simple HTTP Server (For serving the application)"
echo "3) Start both servers"
echo "4) Open application in browser"
echo "5) Show status"
echo

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        start_server
        ;;
    2)
        echo "🌐 Starting Simple HTTP Server on port 8000..."
        echo "📍 Access the application at: http://localhost:8000/enhanced-index.html"
        echo "Press Ctrl+C to stop the server"
        python3 -m http.server 8000
        ;;
    3)
        echo "🚀 Starting both servers..."
        echo "📊 User Data Server: http://localhost:3001"
        echo "🌐 Application Server: http://localhost:8000"
        echo "📍 Open: http://localhost:8000/enhanced-index.html"
        echo
        echo "Starting User Data Server in background..."
        python3 scripts/user-data-server.py &
        SERVER_PID=$!
        echo "User Data Server PID: $SERVER_PID"
        
        echo "Starting HTTP Server..."
        echo "Press Ctrl+C to stop both servers"
        
        # Trap to kill background server when script exits
        trap "echo; echo 'Stopping servers...'; kill $SERVER_PID 2>/dev/null; exit" INT
        
        python3 -m http.server 8000
        ;;
    4)
        open_app
        ;;
    5)
        echo
        echo "=== UAL M2 Status ==="
        echo "📁 Data directories:"
        echo "  Users: $(pwd)/data/users/"
        echo "  Memories: $(pwd)/data/memories/"
        
        if [ -d "data/users" ]; then
            echo "✅ Users directory exists"
            user_count=$(find data/users -name "*.json" 2>/dev/null | wc -l)
            echo "📄 User files: $user_count"
        else
            echo "❌ Users directory not found"
        fi
        
        if [ -d "data/memories" ]; then
            echo "✅ Memories directory exists"
            memory_count=$(find data/memories -name "*.json" 2>/dev/null | wc -l)
            echo "📄 Memory files: $memory_count"
        else
            echo "❌ Memories directory not found"
        fi
        echo
        
        # Check if servers are running
        if lsof -i :3001 &> /dev/null; then
            echo "✅ User Data Server (port 3001): Running"
        else
            echo "❌ User Data Server (port 3001): Not running"
        fi
        
        if lsof -i :8000 &> /dev/null; then
            echo "✅ HTTP Server (port 8000): Running"
        else
            echo "❌ HTTP Server (port 8000): Not running"
        fi
        ;;
    *)
        echo "Invalid choice. Please run the script again and choose 1-5."
        ;;
esac