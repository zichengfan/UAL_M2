# Uploads Directory

This directory stores user-uploaded files (images and trajectories) for memories.

## Structure

- `images/` - Uploaded image files (PNG, JPG, etc.)
- `trajectories/` - Uploaded trajectory files (GeoJSON, GPX)

## Note

Uploaded files are not tracked in git for privacy and size reasons. The directory structure is preserved with `.gitkeep` files.

## API Endpoints

Files are uploaded via the server API:
- POST `/api/upload/image` - Upload an image
- POST `/api/upload/trajectory` - Upload a trajectory

Files are saved with unique UUIDs to prevent naming conflicts.
