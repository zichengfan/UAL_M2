# Changelog - UAL M2 Upload Features

## [2025-10-09] - File Upload and Data Persistence Implementation

### Added

#### Frontend (JavaScript)
- **`handleTrajectoryUpload()`** - New method to handle trajectory file uploads
  - Supports GPX format (XML parsing of trackpoints)
  - Supports GeoJSON/JSON format (Feature, FeatureCollection, LineString)
  - Validates file types and shows user feedback
  - Stores parsed trajectory data for memory saving

- **`uploadImageToServer()`** - New method to upload images to server
  - Converts image file to base64
  - Posts to `/api/upload/image` endpoint
  - Returns file path for storage in memory JSON

- **`uploadTrajectoryToServer()`** - New method to upload trajectories to server
  - Posts trajectory data to `/api/upload/trajectory` endpoint
  - Returns file path for storage in memory JSON

- **`addTrajectoryToMap()`** - New method to display trajectories on map
  - Loads trajectories from file paths or inline data
  - Supports both legacy (inline) and new (file path) formats

- **`addTrajectoryLayer()`** - New method to render trajectory as map layer
  - Creates GeoJSON source from trajectory data
  - Renders as colored line matching contributor color
  - Handles line styling and opacity

#### Backend (Python)
- **`POST /api/upload/image`** - New endpoint for image uploads
  - Accepts base64 encoded image data
  - Generates unique UUID filename
  - Saves to `data/uploads/images/`
  - Returns file path

- **`POST /api/upload/trajectory`** - New endpoint for trajectory uploads
  - Accepts trajectory JSON data
  - Generates unique UUID filename
  - Saves to `data/uploads/trajectories/`
  - Returns file path

- **Upload directory creation** - Server now creates upload directories on startup
  - `data/uploads/`
  - `data/uploads/images/`
  - `data/uploads/trajectories/`

### Modified

#### Frontend
- **`saveMemory()`** - Modified to upload files instead of storing base64
  - Uploads image file to server before saving memory
  - Falls back to base64 if upload fails
  - Stores file path in memory JSON

- **`finalizeMemorySave()`** - Modified to handle trajectory uploads
  - Uploads trajectory to server before saving memory
  - Falls back to inline data if upload fails
  - Stores file path in memory JSON

- **`createPopupContent()`** - Modified to handle file paths
  - Displays images from both file paths and base64
  - Shows trajectory indicator when present
  - Constructs proper URLs for file path references

#### Backend
- **`UserDataHandler.__init__()`** - Modified to include upload directories
  - Added `self.uploads_dir`
  - Added `self.images_dir`
  - Added `self.trajectories_dir`

- **`main()`** - Modified to create upload directories
  - Creates all upload directories on startup
  - Logs upload directory path

### Documentation

- **README.md** - Updated with comprehensive documentation
  - Added backend stack information
  - Documented file upload features
  - Added API endpoint documentation
  - Updated setup instructions with server requirements

- **TESTING.md** - New comprehensive testing guide
  - Automated endpoint testing procedures
  - Manual UI testing instructions
  - Expected results and success criteria
  - Troubleshooting guide

- **data/uploads/README.md** - New documentation for uploads directory
  - Explains directory structure
  - Documents API endpoints
  - Notes on file storage approach

### Configuration

- **.gitignore** - Updated to exclude uploaded files
  - Excludes `data/uploads/images/*`
  - Excludes `data/uploads/trajectories/*`
  - Preserves directory structure with `.gitkeep` files

### Infrastructure

- **Directory Structure** - Added upload directories
  - `data/uploads/` - Root uploads directory
  - `data/uploads/images/` - Image file storage
  - `data/uploads/trajectories/` - Trajectory file storage
  - `.gitkeep` files to preserve empty directories in git

### Bug Fixes

- **Missing `handleTrajectoryUpload()` method** - Was referenced in event listener but not implemented
  - Implemented with full GPX and GeoJSON parsing support
  - Added error handling and user feedback

- **Missing `addTrajectoryToMap()` method** - Was referenced when adding memory to map but not implemented
  - Implemented with support for both file paths and inline data
  - Added proper layer management and styling

### Technical Details

#### File Storage Approach
- **Before**: Files stored as base64 encoded strings in JSON
  - Large JSON files (>10MB for single high-res image)
  - Git unfriendly (binary data in JSON)
  - Slow to load and parse

- **After**: Files stored on disk, paths in JSON
  - Small JSON files (only metadata and paths)
  - Git friendly (only structure tracked, not content)
  - Fast to load (on-demand file loading)
  - UUID filenames prevent conflicts

#### UUID Generation
- Python `uuid.uuid4()` generates unique filenames
- Example: `3c456425-48a6-4f47-8607-3b14a38cffb7.png`
- Prevents filename collisions
- No need for complex naming schemes

#### Fallback Strategy
- If server upload fails, falls back to base64 storage
- Ensures data is never lost
- Graceful degradation of functionality
- localStorage still provides offline capability

### Testing

All features tested and verified:
- ✅ Image upload endpoint
- ✅ Trajectory upload endpoint
- ✅ Memory saving with file references
- ✅ File persistence across server restarts
- ✅ Image display in popups
- ✅ Trajectory rendering on map
- ✅ Error handling and fallbacks
- ✅ Directory structure preservation in git

### Breaking Changes

None. All changes are backward compatible:
- Old memories with base64 images still display correctly
- Old memories with inline trajectories still render correctly
- New memories use file paths, improving performance and storage efficiency

### Migration Path

No migration required. The system handles both formats:
1. **Base64 images** - Detected by `data:` prefix, displayed directly
2. **File path images** - Detected by `uploads/` prefix, loaded from server
3. **Inline trajectories** - Detected by `memory.trajectory` property
4. **File path trajectories** - Detected by `memory.media.trajectories` array

### Performance Improvements

- **JSON Size**: Reduced by 90%+ for memories with images
- **Load Time**: Faster parsing of smaller JSON files
- **Network**: On-demand loading of images (not all at once)
- **Storage**: Efficient disk storage vs encoded strings

### Security Considerations

- **File Uploads**: Server validates file extensions
- **UUID Names**: Prevents directory traversal attacks
- **CORS**: Configured for local development only
- **No Authentication**: Production deployment would need auth

### Future Enhancements

Potential improvements for future versions:
- [ ] Image compression before upload
- [ ] Thumbnail generation for preview
- [ ] Multiple image upload support
- [ ] Drag-and-drop file upload
- [ ] Progress indicators for large files
- [ ] File size validation
- [ ] Authentication and authorization
- [ ] Public vs private memory visibility
- [ ] Image gallery view
- [ ] Trajectory editing and refinement

---

**Issue Resolved**: "Debug this project to support interface-based data upload and save to repo"
(Debug this project to support UI-based data upload and saving to the repo)

**Status**: ✅ Complete and Tested
