# UAL M2 - Memory Map

A web-mapping project using Mapbox to serve as an interactive memory keeper for organization members. This application allows users to upload images, text, and trajectory data to create a visual timeline of activities and behaviors on an interactive map.

## 🎯 Project Overview

This project creates a digital "time machine" that preserves memories and activities of organization members who are leaving. It provides an intuitive way to:

- **Map Memories**: Pin important locations with stories and images
- **Track Journeys**: Upload and visualize trajectory data (GPX files)
- **Share Stories**: Combine text, images, and locations into meaningful memories
- **Preserve Legacy**: Keep organizational knowledge and experiences alive

## ✨ Features

- **Interactive Mapping**: Built on Mapbox GL JS for smooth, responsive maps
- **Multi-format Upload Support**: 
  - Images (JPG, PNG, GIF)
  - Trajectory files (GPX, GeoJSON)
  - Text annotations
- **Real-time Visualization**: See memories appear on the map instantly
- **Local Storage**: Memories persist in browser storage
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Simple Interface**: Clean, intuitive UI that's not overly complicated
- **Memory Management**: Browse, navigate to, and manage saved memories

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/zichengfan/UAL_M2.git
   cd UAL_M2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Mapbox token**
   - See [README-SETUP.md](README-SETUP.md) for detailed instructions
   - Get a free token from [Mapbox](https://account.mapbox.com/)
   - Replace the demo token in `script.js`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Start adding memories to the map!

## 📖 How to Use

1. **Add a Memory**:
   - Fill in member name, title, and description
   - Optionally upload an image or trajectory file
   - Click "Click Map to Add Location"
   - Click anywhere on the map to set the memory location
   - Click "Save Memory"

2. **View Memories**:
   - Click on any blue marker to see the memory popup
   - Use the memories list in the sidebar to navigate to specific memories
   - Trajectory paths will appear as red lines on the map

3. **Manage Memories**:
   - View all memories in the sidebar list
   - Click on a memory in the list to fly to its location
   - Use "Clear All Memories" to reset the map

## 🛠️ Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript (no heavy frameworks)
- **Mapping**: Mapbox GL JS v2.15.0
- **Storage**: Browser localStorage for persistence
- **File Support**: FileReader API for image and trajectory processing
- **Responsive**: CSS Grid and Flexbox for mobile-friendly design

## 📂 Project Structure

```
UAL_M2/
├── index.html          # Main application interface
├── styles.css          # All styling and responsive design
├── script.js           # Core functionality and map integration
├── package.json        # Dependencies and scripts
├── README.md           # This file
├── README-SETUP.md     # Detailed setup instructions
└── .gitignore         # Git ignore patterns
```

## 🔧 Configuration

The application requires a Mapbox access token to function. See [README-SETUP.md](README-SETUP.md) for:
- How to get a free Mapbox token
- Token configuration options
- Environment setup details

## 🎨 Design Philosophy

This project follows the requirement to "not be code-heavy or too complicated":
- **Minimal Dependencies**: Only uses Mapbox GL JS, no heavy frameworks
- **Simple Architecture**: Single HTML file with clear separation of concerns
- **Intuitive Interface**: Clean, straightforward user experience
- **Progressive Enhancement**: Works without JavaScript for basic content
- **Local-First**: No server required, everything runs in the browser

## 🌟 Use Cases

- **Organizational Memory**: Document team activities and locations
- **Personal Journeys**: Track important places and experiences
- **Educational Projects**: Map learning experiences and field trips
- **Community Mapping**: Collect and share local stories and places
- **Heritage Preservation**: Document historical locations and memories

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🙏 Acknowledgments

- Built with [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- Inspired by the need to preserve organizational memory and experiences
- Designed for simplicity and accessibility
