# UAL M2 - Enhanced Memory Map

A multi-user interactive memory mapping system that allows current members to create and preserve memories for graduating members. Built with Mapbox GL JS and featuring member registration, color-coded contributions, and persistent storage.

## 🎯 Project Overview

This enhanced memory map creates a digital preservation system where:
- **Current members** contribute memories for **graduating members**
- Each contributor gets a **unique color** for their contributions
- **User registration** system with persistent sessions
- **Multi-user switching** to view memories for different graduates
- **Data persistence** using browser localStorage

## ✨ Key Features

### 🎨 Member Registration System
- User registration with personal color assignment
- Email-based login for returning users
- Persistent user sessions across visits
- Contributor profile management

### 🗺️ Enhanced Mapping
- Interactive Mapbox GL JS integration
- Color-coded memory markers by contributor
- Urban Analytics Lab location marker
- Smooth user switching between graduates

### 📝 Memory Management
- Rich memory creation with title, description, tags
- Image upload support
- Location-based memory placement
- Memory browsing and navigation

### 👥 Multi-User System
- Graduated member profiles (Dr. Alice Chen, Prof. Bob Wang)
- Contributor registration and management
- Color-based grouping of contributions
- User-specific memory views

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
# Make the script executable
chmod +x start.sh

# Run the script
./start.sh

# Choose option 3 to start both servers
# Then visit: http://localhost:8000/enhanced-index.html
```

### Option 2: Manual Setup

1. **Start the data server** (Required for file uploads and persistence)
   ```bash
   python3 scripts/user-data-server.py
   # Server runs on http://localhost:3001
   ```

2. **Start the web server** (in a new terminal)
   ```bash
   python3 -m http.server 8000
   # Visit: http://localhost:8000/enhanced-index.html
   ```

3. **Use the application**
   - Register as a contributor (get your unique color)
   - Select a graduated member
   - Add memories with images and trajectories
   - All data saves to the `data/` directory

## 📁 Project Structure

```
UAL_M2/
├── enhanced-index.html          # Main application entry
├── css/
│   ├── enhanced-styles.css      # Enhanced UI styles
│   └── styles.css               # Base styles
├── js/
│   ├── data-manager.js          # User & data management
│   └── enhanced-memory-map.js   # Main application logic
├── scripts/
│   └── user-data-server.py      # Backend server for data & file uploads
├── data/
│   ├── data-structure.json      # Data structure reference
│   ├── memories/                # Memory data storage
│   ├── users/                   # User data storage
│   └── uploads/                 # User uploaded files (images & trajectories)
│       ├── images/              # Uploaded images
│       └── trajectories/        # Uploaded trajectory files (GPX/GeoJSON)
└── README.md                    # This file
```

## 🔧 Technical Implementation

### Frontend Stack
- **Mapbox GL JS v2.15.0** - Interactive mapping
- **Vanilla JavaScript** - No external frameworks
- **LocalStorage API** - Data persistence (with server backup)
- **CSS Grid/Flexbox** - Responsive layout

### Backend Stack
- **Python 3** HTTP server for data persistence
- **File upload handling** for images and trajectories
- **JSON storage** for users and memories
- **CORS support** for local development

### Data Management
- User registration and color assignment
- Memory data with contributor attribution
- **File upload handling** for images and trajectories (GPX/GeoJSON)
- Persistent user sessions
- Server-side storage with localStorage fallback

### File Upload Features
- **Image Upload**: Supports common image formats (PNG, JPG, etc.)
- **Trajectory Upload**: Supports GPX and GeoJSON formats
- **Server Storage**: Files saved to `data/uploads/` with unique UUIDs
- **Path References**: Only file paths stored in memory JSON (not base64)

### Color System
- 10 predefined colors for contributors
- Automatic color assignment on registration
- Visual grouping of contributions by color
- Consistent color usage across sessions

## 📡 API Endpoints

The backend server (`scripts/user-data-server.py`) provides the following REST API endpoints:

### User Management
- `POST /api/users/save` - Save individual user
- `POST /api/users/save-all` - Save all users
- `GET /api/users/list` - List all users
- `GET /api/users/{id}` - Get specific user

### Memory Management
- `POST /api/memories/save-all` - Save all memories
- `GET /api/memories/list` - List all memories
- `GET /api/memories/{id}` - Get specific memory

### File Uploads
- `POST /api/upload/image` - Upload image file (returns file path)
  - Request: `{ "data": "base64...", "extension": "png" }`
  - Response: `{ "status": "success", "path": "uploads/images/{uuid}.png" }`
- `POST /api/upload/trajectory` - Upload trajectory file (returns file path)
  - Request: `{ "data": {...}, "extension": "json" }`
  - Response: `{ "status": "success", "path": "uploads/trajectories/{uuid}.json" }`

All endpoints support CORS for local development.

## 🎨 User Experience

1. **First Visit**: Register to get your personal color
2. **Returning User**: Quick login with email
3. **Memory Creation**: Add memories with your color marker
4. **Memory Viewing**: Browse memories by graduated member
5. **Session Persistence**: Automatic login on return visits

## 🌐 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 License

This project is part of the Urban Analytics Lab (UAL) at NUS and is intended for internal use and research purposes.

## 🤝 Contributing

This is an internal lab project. For contributions or issues, please contact the UAL team.

---

*Built with ❤️ for the Urban Analytics Lab community*