#!/usr/bin/env python3
"""
UAL M2 - Simple File Server for User Data Management
Handles saving and loading user registration data to/from data/users/ directory
"""

import json
import os
import sys
import base64
import uuid
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UserDataHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, data_dir="data", **kwargs):
        self.data_dir = data_dir
        self.users_dir = os.path.join(data_dir, "users")
        self.memories_dir = os.path.join(data_dir, "memories")
        self.uploads_dir = os.path.join(data_dir, "uploads")
        self.images_dir = os.path.join(self.uploads_dir, "images")
        self.trajectories_dir = os.path.join(self.uploads_dir, "trajectories")
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle saving user data and memories"""
        try:
            if self.path == '/api/users/save':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                user_data = json.loads(post_data.decode('utf-8'))
                
                # Save individual user file
                user_id = user_data.get('id')
                if user_id:
                    user_file_path = os.path.join(self.users_dir, f"{user_id}.json")
                    os.makedirs(self.users_dir, exist_ok=True)
                    
                    with open(user_file_path, 'w', encoding='utf-8') as f:
                        json.dump(user_data, f, indent=2, ensure_ascii=False)
                    
                    logger.info(f"Saved user data for {user_id} to {user_file_path}")
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "message": "User data saved"}).encode())
                else:
                    raise ValueError("No user ID provided")
                    
            elif self.path == '/api/users/save-all':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                contributors_data = json.loads(post_data.decode('utf-8'))
                
                # Save consolidated file
                timestamp = datetime.now().isoformat().replace(':', '-')
                all_users_file = os.path.join(self.users_dir, f"contributors-{timestamp}.json")
                os.makedirs(self.users_dir, exist_ok=True)
                
                with open(all_users_file, 'w', encoding='utf-8') as f:
                    json.dump(contributors_data, f, indent=2, ensure_ascii=False)
                
                # Save individual files
                for user_id, user_data in contributors_data.items():
                    user_file_path = os.path.join(self.users_dir, f"{user_id}.json")
                    with open(user_file_path, 'w', encoding='utf-8') as f:
                        json.dump(user_data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Saved {len(contributors_data)} users to {self.users_dir}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success", 
                    "message": f"Saved {len(contributors_data)} users",
                    "file": all_users_file
                }).encode())
                
            elif self.path == '/api/memories/save-all':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                memories_data = json.loads(post_data.decode('utf-8'))
                
                # Save consolidated memories file
                timestamp = datetime.now().isoformat().replace(':', '-')
                all_memories_file = os.path.join(self.memories_dir, f"memories-{timestamp}.json")
                os.makedirs(self.memories_dir, exist_ok=True)
                
                with open(all_memories_file, 'w', encoding='utf-8') as f:
                    json.dump(memories_data, f, indent=2, ensure_ascii=False)
                
                # Save individual memory files
                for memory_id, memory_data in memories_data.items():
                    memory_file_path = os.path.join(self.memories_dir, f"{memory_id}.json")
                    with open(memory_file_path, 'w', encoding='utf-8') as f:
                        json.dump(memory_data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Saved {len(memories_data)} memories to {self.memories_dir}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success", 
                    "message": f"Saved {len(memories_data)} memories",
                    "file": all_memories_file
                }).encode())
                
            elif self.path == '/api/upload/image':
                # Handle image upload
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                upload_data = json.loads(post_data.decode('utf-8'))
                
                # Create uploads directory if it doesn't exist
                os.makedirs(self.images_dir, exist_ok=True)
                
                # Generate unique filename
                file_extension = upload_data.get('extension', 'png')
                file_id = str(uuid.uuid4())
                filename = f"{file_id}.{file_extension}"
                file_path = os.path.join(self.images_dir, filename)
                
                # Decode and save base64 image
                image_data = upload_data.get('data', '')
                if ',' in image_data:
                    # Remove data URL prefix if present
                    image_data = image_data.split(',', 1)[1]
                
                with open(file_path, 'wb') as f:
                    f.write(base64.b64decode(image_data))
                
                logger.info(f"Saved image to {file_path}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "filename": filename,
                    "path": f"uploads/images/{filename}"
                }).encode())
                
            elif self.path == '/api/upload/trajectory':
                # Handle trajectory upload
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                upload_data = json.loads(post_data.decode('utf-8'))
                
                # Create uploads directory if it doesn't exist
                os.makedirs(self.trajectories_dir, exist_ok=True)
                
                # Generate unique filename
                file_extension = upload_data.get('extension', 'json')
                file_id = str(uuid.uuid4())
                filename = f"{file_id}.{file_extension}"
                file_path = os.path.join(self.trajectories_dir, filename)
                
                # Save trajectory data
                trajectory_data = upload_data.get('data', {})
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(trajectory_data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Saved trajectory to {file_path}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "filename": filename,
                    "path": f"uploads/trajectories/{filename}"
                }).encode())
                
            else:
                self.send_response(404)
                self.end_headers()
                
        except Exception as e:
            logger.error(f"Error saving user data: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())
    
    def do_GET(self):
        """Handle loading user data and memories"""
        try:
            if self.path == '/api/users/list':
                # List all user files
                if not os.path.exists(self.users_dir):
                    users = {}
                else:
                    users = {}
                    for filename in os.listdir(self.users_dir):
                        if filename.endswith('.json') and not filename.startswith('contributors-'):
                            user_file_path = os.path.join(self.users_dir, filename)
                            with open(user_file_path, 'r', encoding='utf-8') as f:
                                user_data = json.load(f)
                                users[user_data['id']] = user_data
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(users).encode())
                
            elif self.path == '/api/memories/list':
                # List all memory files
                if not os.path.exists(self.memories_dir):
                    memories = {}
                else:
                    memories = {}
                    for filename in os.listdir(self.memories_dir):
                        if filename.endswith('.json') and not filename.startswith('memories-'):
                            memory_file_path = os.path.join(self.memories_dir, filename)
                            with open(memory_file_path, 'r', encoding='utf-8') as f:
                                memory_data = json.load(f)
                                memories[memory_data['id']] = memory_data
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(memories).encode())
                
            elif self.path.startswith('/api/users/'):
                # Get specific user
                user_id = self.path.split('/')[-1]
                user_file_path = os.path.join(self.users_dir, f"{user_id}.json")
                
                if os.path.exists(user_file_path):
                    with open(user_file_path, 'r', encoding='utf-8') as f:
                        user_data = json.load(f)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(user_data).encode())
                else:
                    self.send_response(404)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
            elif self.path.startswith('/api/memories/'):
                # Get specific memory
                memory_id = self.path.split('/')[-1]
                memory_file_path = os.path.join(self.memories_dir, f"{memory_id}.json")
                
                if os.path.exists(memory_file_path):
                    with open(memory_file_path, 'r', encoding='utf-8') as f:
                        memory_data = json.load(f)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(memory_data).encode())
                else:
                    self.send_response(404)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
            else:
                self.send_response(404)
                self.end_headers()
                
        except Exception as e:
            logger.error(f"Error loading user data: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())

def create_handler(data_dir):
    """Create a handler class with the specified data directory"""
    class Handler(UserDataHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, data_dir=data_dir, **kwargs)
    return Handler

def main():
    port = 3001
    data_dir = "data"
    
    # Ensure data directories exist
    users_dir = os.path.join(data_dir, "users")
    memories_dir = os.path.join(data_dir, "memories")
    uploads_dir = os.path.join(data_dir, "uploads")
    images_dir = os.path.join(uploads_dir, "images")
    trajectories_dir = os.path.join(uploads_dir, "trajectories")
    
    os.makedirs(users_dir, exist_ok=True)
    os.makedirs(memories_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(trajectories_dir, exist_ok=True)
    
    handler_class = create_handler(data_dir)
    server = HTTPServer(('localhost', port), handler_class)
    
    logger.info(f"Starting UAL M2 User Data Server on port {port}")
    logger.info(f"Users directory: {os.path.abspath(users_dir)}")
    logger.info(f"Memories directory: {os.path.abspath(memories_dir)}")
    logger.info(f"Uploads directory: {os.path.abspath(uploads_dir)}")
    logger.info("API endpoints:")
    logger.info("  POST /api/users/save - Save individual user")
    logger.info("  POST /api/users/save-all - Save all users")
    logger.info("  POST /api/memories/save-all - Save all memories")
    logger.info("  POST /api/upload/image - Upload image file")
    logger.info("  POST /api/upload/trajectory - Upload trajectory file")
    logger.info("  GET  /api/users/list - List all users")
    logger.info("  GET  /api/memories/list - List all memories")
    logger.info("  GET  /api/users/{id} - Get specific user")
    logger.info("  GET  /api/memories/{id} - Get specific memory")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        server.shutdown()

if __name__ == "__main__":
    main()