// UAL M2 Memory Map - Main JavaScript

class MemoryMap {
    constructor() {
        this.map = null;
        this.memories = [];
        this.isAddingMarker = false;
        this.currentImageFile = null;
        this.currentTrajectoryData = null;
        this.markers = [];
        
        this.init();
    }

    init() {
        this.initializeMap();
        this.setupEventListeners();
        this.loadMemories();
    }

    initializeMap() {
        // Using a demo Mapbox access token for testing purposes
        // In production, replace with your own token from https://account.mapbox.com/
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        
        // Initialize map with London as center (can be changed)
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-0.1276, 51.5074], // London coordinates
            zoom: 10,
            pitch: 0,
            bearing: 0
        });

        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl());

        // Add geolocate control
        this.map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            })
        );

        // Handle map clicks for adding markers
        this.map.on('click', (e) => {
            if (this.isAddingMarker) {
                this.addMemoryMarker(e.lngLat);
            }
        });

        this.map.on('load', () => {
            console.log('Map loaded successfully');
            this.renderSavedMemories();
        });
    }

    setupEventListeners() {
        // Image upload preview
        document.getElementById('image-upload').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Trajectory upload
        document.getElementById('trajectory-upload').addEventListener('change', (e) => {
            this.handleTrajectoryUpload(e);
        });

        // Add marker mode toggle
        document.getElementById('add-marker-btn').addEventListener('click', () => {
            this.toggleAddMarkerMode();
        });

        // Save memory
        document.getElementById('save-memory-btn').addEventListener('click', () => {
            this.saveMemory();
        });

        // Clear all memories
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllMemories();
        });

        // Form validation
        const inputs = ['member-name', 'memory-title', 'memory-text'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.validateForm();
            });
        });
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        this.currentImageFile = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Memory preview">`;
        };
        reader.readAsDataURL(file);
        
        this.validateForm();
    }

    handleTrajectoryUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                
                if (file.name.endsWith('.gpx')) {
                    this.currentTrajectoryData = this.parseGPX(content);
                } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
                    this.currentTrajectoryData = JSON.parse(content);
                }
                
                console.log('Trajectory data loaded:', this.currentTrajectoryData);
                this.validateForm();
            } catch (error) {
                alert('Error parsing trajectory file. Please check the format.');
                console.error('Trajectory parsing error:', error);
            }
        };
        reader.readAsText(file);
    }

    parseGPX(gpxContent) {
        // Simple GPX parser for trajectory points
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
        const trackPoints = xmlDoc.getElementsByTagName('trkpt');
        
        const coordinates = [];
        for (let i = 0; i < trackPoints.length; i++) {
            const lat = parseFloat(trackPoints[i].getAttribute('lat'));
            const lon = parseFloat(trackPoints[i].getAttribute('lon'));
            coordinates.push([lon, lat]);
        }
        
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            properties: {
                name: 'Trajectory'
            }
        };
    }

    toggleAddMarkerMode() {
        this.isAddingMarker = !this.isAddingMarker;
        const btn = document.getElementById('add-marker-btn');
        
        if (this.isAddingMarker) {
            btn.textContent = 'Cancel Adding Location';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');
            this.map.getCanvas().style.cursor = 'crosshair';
        } else {
            btn.textContent = 'Click Map to Add Location';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
            this.map.getCanvas().style.cursor = '';
        }
    }

    addMemoryMarker(lngLat) {
        // Reset marker mode
        this.toggleAddMarkerMode();
        
        // Store coordinates for the memory
        this.currentCoordinates = [lngLat.lng, lngLat.lat];
        
        // Enable save button
        this.validateForm();
        
        // Show temporary marker
        const tempMarker = new mapboxgl.Marker({ color: '#28a745' })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(this.map);
        
        // Store temp marker for cleanup
        this.tempMarker = tempMarker;
    }

    validateForm() {
        const memberName = document.getElementById('member-name').value.trim();
        const memoryTitle = document.getElementById('memory-title').value.trim();
        const memoryText = document.getElementById('memory-text').value.trim();
        
        const hasBasicInfo = memberName && memoryTitle && memoryText;
        const hasLocation = this.currentCoordinates;
        const hasContent = this.currentImageFile || this.currentTrajectoryData;
        
        document.getElementById('save-memory-btn').disabled = !(hasBasicInfo && hasLocation);
    }

    async saveMemory() {
        const memberName = document.getElementById('member-name').value.trim();
        const memoryTitle = document.getElementById('memory-title').value.trim();
        const memoryText = document.getElementById('memory-text').value.trim();
        
        if (!this.currentCoordinates) {
            alert('Please add a location first.');
            return;
        }

        // Prepare memory object
        const memory = {
            id: Date.now(),
            memberName,
            title: memoryTitle,
            text: memoryText,
            coordinates: this.currentCoordinates,
            timestamp: new Date().toISOString(),
            image: null,
            trajectory: this.currentTrajectoryData
        };

        // Handle image if present
        if (this.currentImageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                memory.image = e.target.result;
                this.finalizeMemorySave(memory);
            };
            reader.readAsDataURL(this.currentImageFile);
        } else {
            this.finalizeMemorySave(memory);
        }
    }

    finalizeMemorySave(memory) {
        // Add to memories array
        this.memories.push(memory);
        
        // Save to localStorage
        localStorage.setItem('ual_m2_memories', JSON.stringify(this.memories));
        
        // Add marker to map
        this.addMemoryToMap(memory);
        
        // Clean up temp marker
        if (this.tempMarker) {
            this.tempMarker.remove();
            this.tempMarker = null;
        }
        
        // Reset form
        this.resetForm();
        
        // Update memories list
        this.renderMemoriesList();
        
        alert('Memory saved successfully!');
    }

    addMemoryToMap(memory) {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'memory-marker';
        markerElement.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #007bff;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
        `;

        // Create popup content
        const popupContent = this.createPopupContent(memory);
        
        // Create popup
        const popup = new mapboxgl.Popup({
            offset: 25,
            maxWidth: '300px'
        }).setHTML(popupContent);

        // Create marker
        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(memory.coordinates)
            .setPopup(popup)
            .addTo(this.map);

        // Add trajectory if present
        if (memory.trajectory) {
            this.addTrajectoryToMap(memory);
        }

        // Store marker reference
        this.markers.push({ memory, marker });
    }

    createPopupContent(memory) {
        const date = new Date(memory.timestamp).toLocaleDateString();
        const time = new Date(memory.timestamp).toLocaleTimeString();
        
        let content = `
            <div class="popup-content">
                <h4>${memory.title}</h4>
                <div class="member">Member: ${memory.memberName}</div>
                <div class="description">${memory.text}</div>
        `;
        
        if (memory.image) {
            content += `<img src="${memory.image}" alt="Memory image">`;
        }
        
        content += `
                <div class="timestamp">Added: ${date} at ${time}</div>
            </div>
        `;
        
        return content;
    }

    addTrajectoryToMap(memory) {
        const sourceId = `trajectory-${memory.id}`;
        const layerId = `trajectory-line-${memory.id}`;
        const pointsLayerId = `trajectory-points-${memory.id}`;

        // Add trajectory source
        this.map.addSource(sourceId, {
            type: 'geojson',
            data: memory.trajectory
        });

        // Add trajectory line layer
        this.map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#ff6b6b',
                'line-width': 3,
                'line-opacity': 0.8
            }
        });

        // Add trajectory points layer
        this.map.addLayer({
            id: pointsLayerId,
            type: 'circle',
            source: sourceId,
            paint: {
                'circle-radius': 4,
                'circle-color': '#ff6b6b',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });
    }

    resetForm() {
        document.getElementById('member-name').value = '';
        document.getElementById('memory-title').value = '';
        document.getElementById('memory-text').value = '';
        document.getElementById('image-upload').value = '';
        document.getElementById('trajectory-upload').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('save-memory-btn').disabled = true;
        
        this.currentImageFile = null;
        this.currentTrajectoryData = null;
        this.currentCoordinates = null;
    }

    loadMemories() {
        const saved = localStorage.getItem('ual_m2_memories');
        if (saved) {
            this.memories = JSON.parse(saved);
            console.log(`Loaded ${this.memories.length} memories`);
        }
    }

    renderSavedMemories() {
        this.memories.forEach(memory => {
            this.addMemoryToMap(memory);
        });
        this.renderMemoriesList();
    }

    renderMemoriesList() {
        const listContainer = document.getElementById('memories-list');
        listContainer.innerHTML = '';
        
        if (this.memories.length === 0) {
            listContainer.innerHTML = '<p style="color: #6c757d; font-style: italic;">No memories saved yet.</p>';
            return;
        }

        this.memories.forEach(memory => {
            const item = document.createElement('div');
            item.className = 'memory-item';
            item.innerHTML = `
                <div class="member-name">${memory.memberName}</div>
                <div class="memory-title">${memory.title}</div>
            `;
            
            item.addEventListener('click', () => {
                this.map.flyTo({
                    center: memory.coordinates,
                    zoom: 15,
                    duration: 1000
                });
                
                // Find and trigger popup
                const markerData = this.markers.find(m => m.memory.id === memory.id);
                if (markerData) {
                    markerData.marker.togglePopup();
                }
            });
            
            listContainer.appendChild(item);
        });
    }

    clearAllMemories() {
        if (confirm('Are you sure you want to clear all memories? This action cannot be undone.')) {
            // Clear localStorage
            localStorage.removeItem('ual_m2_memories');
            
            // Clear memories array
            this.memories = [];
            
            // Remove all markers
            this.markers.forEach(({ marker, memory }) => {
                marker.remove();
                
                // Remove trajectory layers if they exist
                if (memory.trajectory) {
                    const sourceId = `trajectory-${memory.id}`;
                    const layerId = `trajectory-line-${memory.id}`;
                    const pointsLayerId = `trajectory-points-${memory.id}`;
                    
                    if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
                    if (this.map.getLayer(pointsLayerId)) this.map.removeLayer(pointsLayerId);
                    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
                }
            });
            
            this.markers = [];
            
            // Update UI
            this.renderMemoriesList();
            
            alert('All memories cleared.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Mapbox is available
    if (typeof mapboxgl === 'undefined') {
        alert('Mapbox GL JS failed to load. Please check your internet connection.');
        return;
    }
    
    // Initialize the memory map
    window.memoryMap = new MemoryMap();
    
    console.log('UAL M2 Memory Map initialized');
});