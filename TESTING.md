# Testing Guide for UAL M2 Upload Features

This document describes how to test the file upload and data persistence features.

## Prerequisites

1. Python 3 installed
2. Both servers running:
   - Data server: `python3 scripts/user-data-server.py` (port 3001)
   - Web server: `python3 -m http.server 8000` (port 8000)

## Automated Testing

### 1. Test Upload Endpoints

```bash
# Test image upload
curl -X POST http://localhost:3001/api/upload/image \
  -H "Content-Type: application/json" \
  -d '{
    "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "extension": "png"
  }'

# Expected response:
# {"status": "success", "filename": "{uuid}.png", "path": "uploads/images/{uuid}.png"}

# Test trajectory upload
curl -X POST http://localhost:3001/api/upload/trajectory \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "LineString",
      "coordinates": [[103.770336, 1.2966], [103.771336, 1.2976]]
    },
    "extension": "json"
  }'

# Expected response:
# {"status": "success", "filename": "{uuid}.json", "path": "uploads/trajectories/{uuid}.json"}
```

### 2. Test Memory Saving

```bash
# Save a memory with uploaded files
curl -X POST http://localhost:3001/api/memories/save-all \
  -H "Content-Type: application/json" \
  -d '{
    "test-memory": {
      "id": "test-memory",
      "title": "Test Memory",
      "description": "Testing uploads",
      "media": {
        "images": ["uploads/images/{uuid}.png"],
        "trajectories": ["uploads/trajectories/{uuid}.json"]
      }
    }
  }'

# Expected response:
# {"status": "success", "message": "Saved 1 memories", "file": "data/memories/memories-{timestamp}.json"}
```

### 3. Verify File Storage

```bash
# Check uploaded images
ls -lh data/uploads/images/

# Check uploaded trajectories
ls -lh data/uploads/trajectories/

# Check saved memories
cat data/memories/test-memory.json
```

## Manual UI Testing

### 1. Register a User

1. Open http://localhost:8000/enhanced-index.html
2. Fill in registration form:
   - Name: Your Name
   - Email: your.email@example.com
3. Click "Register & Get My Color"
4. Verify you see your color assigned

### 2. Test Image Upload

1. Select a graduated member from the list
2. Fill in memory details:
   - Contributor name and email
   - Memory title and description
3. Click "Choose File" under "Upload Image"
4. Select an image file (PNG, JPG, etc.)
5. Verify image preview appears
6. Click on map to add location
7. Click "Save Memory"
8. Verify success message

### 3. Test Trajectory Upload

1. Create a test GeoJSON file:
```json
{
  "type": "LineString",
  "coordinates": [
    [103.770336, 1.2966],
    [103.771336, 1.2976],
    [103.772336, 1.2986]
  ]
}
```

2. Fill in memory details
3. Click "Choose File" under "Upload Trajectory"
4. Select the GeoJSON file
5. Verify "Trajectory file loaded successfully!" message
6. Add location on map
7. Click "Save Memory"
8. Verify trajectory appears as colored line on map

### 4. Test GPX Upload

1. Create a test GPX file:
```xml
<?xml version="1.0"?>
<gpx version="1.1" creator="test">
  <trk>
    <trkseg>
      <trkpt lat="1.2966" lon="103.770336"/>
      <trkpt lat="1.2976" lon="103.771336"/>
      <trkpt lat="1.2986" lon="103.772336"/>
    </trkseg>
  </trk>
</gpx>
```

2. Upload as trajectory
3. Verify parsing and display

## Expected Results

### File Storage
- Images saved to: `data/uploads/images/{uuid}.{ext}`
- Trajectories saved to: `data/uploads/trajectories/{uuid}.json`
- Memories saved to: `data/memories/{id}.json`

### Memory JSON Structure
```json
{
  "id": "memory-id",
  "title": "Memory Title",
  "description": "Memory description",
  "media": {
    "images": ["uploads/images/{uuid}.png"],
    "trajectories": ["uploads/trajectories/{uuid}.json"]
  },
  "coordinates": [103.770336, 1.2966],
  "contributorName": "John Doe",
  "timestamp": "2025-10-09T07:00:00Z"
}
```

### Map Display
- Memory markers shown with contributor colors
- Trajectories rendered as colored lines
- Clicking markers shows popups with:
  - Title and description
  - Contributor name and date
  - Image (if present)
  - Trajectory indicator (if present)

## Troubleshooting

### Issue: Upload fails with "Server error: 500"
**Solution:** Check server logs. Ensure `data/uploads/` directories exist.

### Issue: Image doesn't display in popup
**Solution:** Verify image path is correct and web server is serving files from data/uploads/

### Issue: Trajectory doesn't appear on map
**Solution:** 
1. Check browser console for errors
2. Verify GeoJSON/GPX format is correct
3. Ensure coordinates are in [longitude, latitude] order

### Issue: Files not persisting
**Solution:**
1. Verify data server is running on port 3001
2. Check data server logs for errors
3. Ensure write permissions on data/ directories

## Success Criteria

✅ Image uploads save to disk with unique filenames
✅ Trajectory uploads parse and save correctly
✅ Memory data references file paths (not base64)
✅ Files persist across server restarts
✅ Images display correctly in memory popups
✅ Trajectories render as lines on map
✅ All API endpoints return success responses
✅ localStorage provides fallback when server unavailable
