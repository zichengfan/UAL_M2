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

1. **Open the application**
   ```bash
   # Method 1: Direct browser access
   open enhanced-index.html
   
   # Method 2: Local server
   python3 -m http.server 8080
   # Visit: http://localhost:8080/enhanced-index.html
   ```

2. **Register as a contributor**
   - Fill in your name and email
   - Get assigned a unique color
   - Start contributing memories

3. **Select a graduated member**
   - Choose from available graduated members
   - Add memories specifically for them
   - View existing memories by color

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
├── data/
│   ├── data-structure.json      # Data structure reference
│   ├── memories/                # Memory data storage
│   ├── users/                   # User data storage
│   └── uploads/                 # User uploaded files
└── README.md                    # This file
```

## 🔧 Technical Implementation

### Frontend Stack
- **Mapbox GL JS v2.15.0** - Interactive mapping
- **Vanilla JavaScript** - No external frameworks
- **LocalStorage API** - Data persistence
- **CSS Grid/Flexbox** - Responsive layout

### Data Management
- User registration and color assignment
- Memory data with contributor attribution
- File upload handling for images
- Persistent user sessions

### Color System
- 10 predefined colors for contributors
- Automatic color assignment on registration
- Visual grouping of contributions by color
- Consistent color usage across sessions

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