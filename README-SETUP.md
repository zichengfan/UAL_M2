# UAL M2 Memory Map Configuration

## Mapbox Setup

To use this application, you'll need a Mapbox access token:

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account or sign in
3. Go to your account dashboard
4. Create a new access token or use the default public token
5. Copy the token

## Setting up the token

### Option 1: Direct replacement (for testing)
Edit `script.js` and replace the line:
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoidWFsbTIiLCJhIjoiY2tsMWQ0NjRkMGZzMDJubzRlaHc4Y3U4bCJ9.demo_token_replace_with_real';
```

With your actual token:
```javascript
mapboxgl.accessToken = 'your_actual_token_here';
```

### Option 2: Environment-based (recommended for production)
Create a `.env` file in the project root:
```
MAPBOX_ACCESS_TOKEN=your_actual_token_here
```

Then update the script to read from environment variables.

## Demo Token Notice
The current demo token in the code is not functional and is only for illustration purposes. You must replace it with a real Mapbox token for the application to work.

## Free Usage Limits
Mapbox free tier includes:
- 50,000 free map loads per month
- No credit card required for free tier
- Perfect for development and small projects

## Running the Application

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Open http://localhost:3000 in your browser

## Features

- **Interactive Map**: Click to add memory locations
- **Image Upload**: Add photos to memories
- **Trajectory Upload**: Support for GPX and GeoJSON files
- **Local Storage**: Memories persist in browser storage
- **Responsive Design**: Works on desktop and mobile
- **Memory Management**: View, navigate to, and clear memories