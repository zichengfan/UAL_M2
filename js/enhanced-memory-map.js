// UAL M2 Memory Map - Main Application

class EnhancedMemoryMap {
    constructor() {
        this.map = null;
        this.userManager = new DataManager();
        this.dataManager = new MemoryDataManager();
        this.currentTargetUser = null;
        this.markers = new Map(); // Map of userId -> markers array
        this.labMarker = null; // Reference to the lab marker
        this.isAddingMarker = false;
        this.currentImageFile = null;
        this.currentTrajectoryData = null;
        this.currentCoordinates = null;
        this.tempMarker = null;
        this.currentRegisteredContributor = null; // Currently logged in contributor
        
        // Don't initialize immediately - wait for DOM
        console.log('EnhancedMemoryMap constructor completed');
    }

    async init() {
        try {
            console.log('Starting enhanced memory map initialization...');
            
            // Check if required elements exist
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                throw new Error('Map container not found');
            }
            console.log('✅ Map container found');
            
            // Initialize map first (critical)
            console.log('🗺️ Initializing map...');
            this.initializeMap();
            console.log('✅ Map initialized successfully');
            
            // Set up event listeners (critical)
            console.log('🎛️ Setting up event listeners...');
            this.setupEventListeners();
            console.log('✅ Event listeners set up successfully');
            
            // Load data asynchronously (non-blocking)
            console.log('� Loading users and memories...');
            Promise.all([
                this.userManager.loadUsers().catch(err => console.warn('User loading error:', err)),
                this.dataManager.loadMemories().catch(err => console.warn('Memory loading error:', err))
            ]).then(() => {
                console.log('✅ Data loaded, setting up UI...');
                this.setupUserInterface();
                this.loadInitialData();
                console.log('✅ All components ready');
            });
            
            console.log('🎉 Enhanced memory map core initialization completed successfully!');
        } catch (error) {
            console.error('💥 Error during initialization:', error);
            console.error('Stack trace:', error.stack);
            throw error; // Re-throw to let the main handler catch it
        }
    }

    initializeMap() {
        // Using the correct Mapbox access token from script.js
        mapboxgl.accessToken = 'pk.eyJ1IjoiemljaGVuZzAwIiwiYSI6ImNtZ2Y0bmdvajA0d20ya3M5bW92MG95aTQifQ.3Eudd9NKJnK7g7lBc5redQ';
        
        console.log('Initializing enhanced Mapbox with token:', mapboxgl.accessToken);
        
        try {
            this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [103.770336, 1.2966], // Singapore SDE4 coordinates
                zoom: 14,
                pitch: 0,
                bearing: 0
            });

            // Add error handling
            this.map.on('error', (e) => {
                console.error('Mapbox error:', e);
                alert('Map loading error: ' + (e.error?.message || 'Please check network connection and token validity'));
            });

            // Add navigation controls
            this.map.addControl(new mapboxgl.NavigationControl());

            // Note: Removed GeolocateControl as it might show a location icon that looks like a house

            // Handle map clicks for adding markers
            this.map.on('click', (e) => {
                if (this.isAddingMarker) {
                    this.addMemoryMarker(e.lngLat);
                }
            });

            this.map.on('load', () => {
                console.log('Enhanced map loaded successfully');
                this.addUrbanAnalyticsLabMarker();
                this.loadMemoriesForCurrentUser();
            });

        } catch (error) {
            console.error('Failed to initialize map:', error);
            alert('Map initialization failed: ' + error.message);
        }
    }

    setupUserInterface() {
        console.log('Setting up user interface...');
        
        // Create user switcher
        this.createUserSwitcher();
        
        // Set default user
        const graduatedMembers = this.userManager.getGraduatedMembers();
        console.log('Graduated members found:', graduatedMembers);
        
        if (graduatedMembers.length > 0) {
            console.log('Setting default user to:', graduatedMembers[0].id);
            this.switchToUser(graduatedMembers[0].id);
        } else {
            console.warn('No graduated members found');
        }
    }

    createUserSwitcher() {
        console.log('Creating user switcher...');
        
        // Check if switcher already exists
        const existingSwitcher = document.getElementById('user-switcher');
        if (existingSwitcher) {
            console.log('User switcher already exists, removing old one');
            existingSwitcher.remove();
        }
        
        const graduatedMembers = this.userManager.getGraduatedMembers();
        console.log('Creating switcher for members:', graduatedMembers);
        
        // Create user switcher container
        const switcherContainer = document.createElement('div');
        switcherContainer.id = 'user-switcher';
        switcherContainer.className = 'user-switcher';
        
        switcherContainer.innerHTML = `
            <div class="switcher-header">
                <h3>👨‍🎓 Select Graduate Member</h3>
                <p>View memories for specific members</p>
            </div>
            <div class="user-buttons">
                ${graduatedMembers.map(user => `
                    <button class="user-btn" data-user-id="${user.id}">
                        <div class="user-avatar">👤</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-detail">${user.graduationDate}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
            <div class="current-user-info">
                <div id="current-user-display">Please select a graduate member</div>
            </div>
        `;

        // Add to control panel
        const controlPanel = document.querySelector('.control-panel');
        const panelHeader = controlPanel.querySelector('.panel-header');
        
        console.log('Control panel found:', !!controlPanel);
        console.log('Panel header found:', !!panelHeader);
        
        if (controlPanel && panelHeader) {
            panelHeader.parentNode.insertBefore(switcherContainer, panelHeader.nextSibling);
            console.log('User switcher inserted into DOM');
        } else {
            console.error('Could not find control panel or panel header');
        }

        // Add event listeners for user buttons
        switcherContainer.addEventListener('click', (e) => {
            const userBtn = e.target.closest('.user-btn');
            if (userBtn) {
                // dataset.userId corresponds to data-user-id
                const userId = userBtn.dataset.userId;
                console.log('User button clicked:', userId);
                console.log('Button element:', userBtn);
                console.log('All dataset:', userBtn.dataset);
                if (userId) {
                    this.switchToUser(userId);
                } else {
                    console.error('No userId found in button dataset');
                }
            }
        });
    }

    switchToUser(userId) {
        console.log(`Switching to user: ${userId}`);
        
        this.currentTargetUser = userId;
        this.userManager.setCurrentTargetUser(userId);
        
        console.log('currentTargetUser set to:', this.currentTargetUser);
        
        // Update UI
        this.updateCurrentUserDisplay(userId);
        this.updateUserButtonStates(userId);
        
        // Clear existing markers
        this.clearAllMarkers();
        
        // Load memories for new user
        this.loadMemoriesForCurrentUser();
        
        // Update map style based on user preferences (optional)
        this.updateMapStyle(userId);
        
        // Trigger form validation to update button state
        this.validateForm();
    }

    updateCurrentUserDisplay(userId) {
        const user = this.userManager.getUserById(userId);
        const display = document.getElementById('current-user-display');
        
        if (user && display) {
            display.innerHTML = `
                <div class="active-user">
                    <strong>Currently viewing:</strong> ${user.name}
                    <div class="user-bio">${user.biography || ''}</div>
                </div>
            `;
        }
    }

    updateUserButtonStates(activeUserId) {
        const buttons = document.querySelectorAll('.user-btn');
        buttons.forEach(btn => {
            if (btn.dataset.userId === activeUserId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateMapStyle(userId) {
        // Optional: Different map styles for different users
        const user = this.userManager.getUserById(userId);
        if (user) {
            // Could switch between different map styles
            // this.map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
        }
    }

    loadMemoriesForCurrentUser() {
        if (!this.currentTargetUser) return;
        
        const userMemories = this.dataManager.getMemoriesForUser(this.currentTargetUser);
        console.log(`Loading ${userMemories.length} memories for user ${this.currentTargetUser}`);
        
        userMemories.forEach(memory => {
            this.addMemoryToMap(memory);
        });
        
        this.renderMemoriesList();
    }

    clearAllMarkers() {
        // Clear all user-specific markers
        this.markers.forEach((markerList, userId) => {
            markerList.forEach(({ marker, memory }) => {
                marker.remove();
                
                // Remove trajectory layers if they exist
                if (memory.trajectory) {
                    this.removeTrajectoryFromMap(memory);
                }
            });
        });
        
        this.markers.clear();
    }

    addUrbanAnalyticsLabMarker() {
        console.log('Creating Urban Analytics Lab marker...');
        
        // Check if lab marker already exists
        if (this.labMarker) {
            console.log('Lab marker already exists, removing old one');
            this.labMarker.remove();
            this.labMarker = null;
        }
        
        // Check if there are existing markers at the same location
        const existingMarkers = document.querySelectorAll('.lab-marker');
        console.log('Found existing lab markers:', existingMarkers.length);
        existingMarkers.forEach((marker, index) => {
            console.log(`Removing existing lab marker ${index}`);
            marker.remove();
        });
        
        const labMarkerElement = document.createElement('div');
        labMarkerElement.className = 'lab-marker';
        labMarkerElement.innerHTML = '🏠';
        
        Object.assign(labMarkerElement.style, {
            width: '30px',
            height: '30px',
            fontSize: '24px',
            cursor: 'pointer',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '0',
            padding: '0',
            border: 'none',
            background: 'transparent',
            zIndex: '1000'
        });

        const labPopupContent = `
            <div class="popup-content lab-popup">
                <h3 style="color: #007bff; margin-bottom: 10px;">🏠 Urban Analytics Lab</h3>
                <div style="margin-bottom: 8px;"><strong>Location:</strong> NUS SDE4</div>
                <div style="margin-bottom: 8px;"><strong>Coordinates:</strong> 103.770336, 1.2966</div>
                <div style="color: #6c757d; font-style: italic;">Research hub for urban data science and analytics</div>
            </div>
        `;

        const labPopup = new mapboxgl.Popup({
            offset: 25,
            maxWidth: '280px',
            className: 'lab-popup',
            closeOnClick: false
        }).setHTML(labPopupContent);

        const labMarker = new mapboxgl.Marker({
            element: labMarkerElement,
            anchor: 'center',
            offset: [0, 0]
        })
            .setLngLat([103.770336, 1.2966])
            .setPopup(labPopup)
            .addTo(this.map);

        // Store reference to lab marker
        this.labMarker = labMarker;

        // Add CSS for lab marker
        if (!document.getElementById('lab-marker-styles')) {
            const style = document.createElement('style');
            style.id = 'lab-marker-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .lab-marker {
                    animation: pulse 2s infinite;
                }
            `;
            document.head.appendChild(style);
        }

        console.log('Urban Analytics Lab marker added');
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

        // Clear form
        document.getElementById('clear-form-btn').addEventListener('click', () => {
            this.resetForm();
        });

        // Clear all memories
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllMemoriesForCurrentUser();
        });

        // Form validation
        const inputs = ['contributor-name', 'memory-title', 'memory-text'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.validateForm();
                });
            }
        });

        // Registration event listeners
        this.setupRegistrationEventListeners();
    }

    setupRegistrationEventListeners() {
        // Register button
        document.getElementById('register-btn').addEventListener('click', () => {
            this.handleRegistration();
        });

        // Login button (show login form)
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showLoginForm();
        });

        // Login submit
        document.getElementById('login-submit-btn').addEventListener('click', () => {
            this.handleLogin();
        });

        // Back to registration
        document.getElementById('back-to-register-btn').addEventListener('click', () => {
            this.showRegistrationForm();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    loadInitialData() {
        // Load any existing memories
        this.renderMemoriesList();
        
        // Check if user is already logged in
        this.checkExistingSession();
    }

    checkExistingSession() {
        // Check if there's a saved session
        const lastEmail = localStorage.getItem('ual_m2_last_contributor_email');
        if (lastEmail) {
            const contributor = this.userManager.getContributorByEmail(lastEmail);
            if (contributor) {
                this.currentRegisteredContributor = contributor;
                this.showContributorInfo();
                this.prefillContributorName();
            }
        }
    }

    // Registration Methods
    async handleRegistration() {
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const affiliation = document.getElementById('reg-affiliation').value.trim();
        const showName = document.getElementById('reg-show-name').checked;
        const allowContact = document.getElementById('reg-allow-contact').checked;

        if (!name || !email) {
            alert('Please enter your name and email address.');
            return;
        }

        // Check if email already exists
        const existing = this.userManager.getContributorByEmail(email);
        if (existing) {
            alert('This email is already registered. Please use the login option.');
            return;
        }

        try {
            const contributor = await this.userManager.registerContributor({
                name,
                email,
                affiliation,
                showName,
                allowContact
            });

            this.currentRegisteredContributor = contributor;
            this.showContributorInfo();
            this.prefillContributorName();
            
            alert(`🎉 Welcome ${name}! You've been assigned the color ${contributor.color}. Your contributions will now be saved and grouped by this color.`);

        } catch (error) {
            alert('Registration failed. Please try again.');
            console.error('Registration error:', error);
        }
    }

    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        
        if (!email) {
            alert('Please enter your email address.');
            return;
        }

        const contributor = this.userManager.getContributorByEmail(email);
        if (!contributor) {
            alert('Email not found. Please register first or check your email address.');
            return;
        }

        this.currentRegisteredContributor = contributor;
        localStorage.setItem('ual_m2_last_contributor_email', email);
        this.showContributorInfo();
        this.prefillContributorName();
        
        alert(`Welcome back, ${contributor.name}! Your assigned color is ${contributor.color}.`);
    }

    handleLogout() {
        this.currentRegisteredContributor = null;
        this.showRegistrationForm();
        this.clearContributorName();
    }

    showRegistrationForm() {
        document.getElementById('registration-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('current-contributor-info').style.display = 'none';
    }

    showLoginForm() {
        document.getElementById('registration-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('current-contributor-info').style.display = 'none';
    }

    showContributorInfo() {
        if (!this.currentRegisteredContributor) return;

        const contributor = this.currentRegisteredContributor;
        
        document.getElementById('registration-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('current-contributor-info').style.display = 'block';

        // Update display - use 'color' attribute from DataManager
        document.getElementById('contributor-color-preview').style.backgroundColor = contributor.color || '#666666';
        document.getElementById('contributor-name-display').textContent = contributor.name;
        document.getElementById('contributor-email-display').textContent = contributor.email;
        
        const stats = `Registered: ${new Date(contributor.registrationDate).toLocaleDateString()}, Contributions: ${contributor.memoriesContributed?.length || 0}`;
        document.getElementById('contributor-stats').textContent = stats;
        
        // Auto-fill contributor name in the memory form
        this.prefillContributorName();
    }

    prefillContributorName() {
        if (this.currentRegisteredContributor) {
            const nameField = document.getElementById('contributor-name');
            const emailField = document.getElementById('contributor-email');
            if (nameField) {
                nameField.value = this.currentRegisteredContributor.name;
                nameField.style.backgroundColor = '#e8f5e8';
                nameField.title = 'Auto-filled from your registration';
            }
            if (emailField) {
                emailField.value = this.currentRegisteredContributor.email;
                emailField.style.backgroundColor = '#e8f5e8';
                emailField.title = 'Auto-filled from your registration';
            }
            // Trigger form validation after prefilling
            this.validateForm();
        }
    }

    clearContributorName() {
        // Only clear if user is not logged in
        if (!this.currentRegisteredContributor) {
            const nameField = document.getElementById('contributor-name');
            const emailField = document.getElementById('contributor-email');
            if (nameField) {
                nameField.value = '';
                nameField.style.backgroundColor = '';
                nameField.title = '';
            }
            if (emailField) {
                emailField.value = '';
                emailField.style.backgroundColor = '';
                emailField.title = '';
            }
        }
    }

    // Memory handling methods
    async saveMemory() {
        console.log('🔍 Starting saveMemory process...');
        
        const contributorName = document.getElementById('contributor-name').value.trim();
        const contributorEmail = document.getElementById('contributor-email').value.trim();
        const memoryTitle = document.getElementById('memory-title').value.trim();
        const memoryText = document.getElementById('memory-text').value.trim();
        const memoryTags = document.getElementById('memory-tags').value.trim();
        
        console.log('📝 Form values:', {
            contributorName,
            contributorEmail,
            memoryTitle,
            memoryText,
            memoryTags,
            currentCoordinates: this.currentCoordinates,
            currentTargetUser: this.currentTargetUser
        });
        
        if (!this.currentCoordinates || !this.currentTargetUser) {
            console.log('❌ Missing coordinates or target user');
            alert('Please add a location and select a target user first.');
            return;
        }

        // Prepare memory object with contributor information
        const memory = {
            title: memoryTitle,
            description: memoryText,
            targetUserId: this.currentTargetUser,
            contributorName: contributorName,
            contributorEmail: contributorEmail,
            coordinates: this.currentCoordinates,
            timestamp: new Date().toISOString(),
            type: 'location_memory',
            media: {
                images: [],
                trajectories: []
            },
            tags: memoryTags ? memoryTags.split(',').map(tag => tag.trim()) : [],
            isPublic: true
        };

        console.log('💾 Memory object prepared:', memory);

        // Add registered contributor information if available
        if (this.currentRegisteredContributor) {
            memory.registeredContributorId = this.currentRegisteredContributor.id;
            memory.contributorColor = this.currentRegisteredContributor.color;
            
            // Save session for next visit
            localStorage.setItem('ual_m2_last_contributor_email', this.currentRegisteredContributor.email);
            console.log('👤 Added registered contributor info:', this.currentRegisteredContributor);
        }

        // Handle image if present
        if (this.currentImageFile) {
            console.log('🖼️ Processing image file...');
            try {
                const imagePath = await this.uploadImageToServer(this.currentImageFile);
                memory.media.images.push(imagePath);
                console.log('✅ Image uploaded to server:', imagePath);
            } catch (error) {
                console.error('❌ Failed to upload image:', error);
                // Fall back to base64 if upload fails
                const reader = new FileReader();
                await new Promise((resolve) => {
                    reader.onload = (e) => {
                        memory.media.images.push(e.target.result);
                        console.log('⚠️ Using base64 fallback for image');
                        resolve();
                    };
                    reader.readAsDataURL(this.currentImageFile);
                });
            }
        }
        
        console.log('📝 Proceeding to finalize save...');
        await this.finalizeMemorySave(memory);
    }

    async finalizeMemorySave(memory) {
        console.log('🏁 Finalizing memory save...', memory);
        
        // Upload trajectory data if present
        if (this.currentTrajectoryData) {
            try {
                console.log('🛤️ Uploading trajectory data...');
                const trajectoryPath = await this.uploadTrajectoryToServer(
                    this.currentTrajectoryData,
                    this.currentTrajectoryData.fileName || 'trajectory.json'
                );
                memory.media.trajectories.push(trajectoryPath);
                console.log('✅ Trajectory uploaded to server:', trajectoryPath);
            } catch (error) {
                console.error('❌ Failed to upload trajectory:', error);
                // Fall back to storing in memory object
                memory.trajectory = this.currentTrajectoryData;
                console.log('⚠️ Using inline trajectory data as fallback');
            }
        }

        try {
            console.log('💾 Calling dataManager.saveMemory...');
            // Save to data manager
            const memoryId = await this.dataManager.saveMemory(memory);
            console.log(`✅ Memory saved with ID: ${memoryId}`);
            
            // Add marker to map
            console.log('🗺️ Adding memory to map...');
            this.addMemoryToMap(memory);
            
            // Clean up temp marker
            if (this.tempMarker) {
                console.log('🧹 Cleaning up temp marker...');
                this.tempMarker.remove();
                this.tempMarker = null;
            }
            
            // Reset form
            console.log('🔄 Resetting form...');
            this.resetForm();
            
            console.log('🎉 Memory save process completed successfully!');
            
        } catch (error) {
            console.error('❌ Error in finalizeMemorySave:', error);
            alert('Failed to save memory. Please try again.');
        }
        
        // Update memories list
        this.renderMemoriesList();
        
        alert('Memory saved successfully!');
    }

    addMemoryToMap(memory) {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'memory-marker';
        
        // Use contributor color if available, otherwise default blue
        const markerColor = memory.contributorColor || '#007bff';
        
        markerElement.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${markerColor};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
        `;

        // Create popup content
        const popupContent = this.createPopupContent(memory);
        
        // Create popup
        const popup = new mapboxgl.Popup({
            offset: 25,
            maxWidth: '300px',
            className: 'enhanced-popup'
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
        if (!this.markers.has(memory.targetUserId)) {
            this.markers.set(memory.targetUserId, []);
        }
        this.markers.get(memory.targetUserId).push({ memory, marker });
    }

    async addTrajectoryToMap(memory) {
        // Handle inline trajectory data (legacy/fallback)
        if (memory.trajectory) {
            this.addTrajectoryLayer(memory, memory.trajectory);
            return;
        }
        
        // Handle trajectory file paths (new approach)
        if (memory.media && memory.media.trajectories && memory.media.trajectories.length > 0) {
            for (const trajectoryPath of memory.media.trajectories) {
                try {
                    // Load trajectory from file
                    const response = await fetch(`http://localhost:8000/${trajectoryPath}`);
                    if (response.ok) {
                        const trajectoryData = await response.json();
                        this.addTrajectoryLayer(memory, trajectoryData);
                    } else {
                        console.warn(`Failed to load trajectory from ${trajectoryPath}`);
                    }
                } catch (error) {
                    console.error(`Error loading trajectory:`, error);
                }
            }
        }
    }

    addTrajectoryLayer(memory, trajectoryData) {
        const trajectoryId = `trajectory-${memory.id || Date.now()}`;
        
        // Check if source already exists
        if (this.map.getSource(trajectoryId)) {
            return;
        }
        
        // Add trajectory source
        this.map.addSource(trajectoryId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: trajectoryData
            }
        });
        
        // Add trajectory layer
        this.map.addLayer({
            id: trajectoryId,
            type: 'line',
            source: trajectoryId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': memory.contributorColor || '#888',
                'line-width': 3,
                'line-opacity': 0.7
            }
        });
        
        console.log(`Added trajectory layer: ${trajectoryId}`);
    }

    createPopupContent(memory) {
        const date = new Date(memory.timestamp).toLocaleDateString();
        
        let content = '<div class="popup-header">';
        content += '<h4 class="popup-title">' + memory.title + '</h4>';
        content += '<div class="popup-meta">';
        content += '<span>👤 ' + memory.contributorName + '</span>';
        content += '<span>📅 ' + date + '</span>';
        content += '</div>';
        content += '</div>';
        content += '<div class="popup-description">' + memory.description + '</div>';
        
        // Handle images (both file paths and base64)
        if (memory.media && memory.media.images && memory.media.images.length > 0) {
            const imageSrc = memory.media.images[0];
            // Check if it's a file path or base64
            const imageUrl = imageSrc.startsWith('uploads/') 
                ? `http://localhost:8000/${imageSrc}` 
                : imageSrc;
            content += '<img src="' + imageUrl + '" alt="Memory image" class="popup-image">';
        }
        
        // Show trajectory info if present
        if (memory.media && memory.media.trajectories && memory.media.trajectories.length > 0) {
            content += '<div class="popup-info">🛤️ Trajectory included</div>';
        } else if (memory.trajectory) {
            content += '<div class="popup-info">🛤️ Trajectory included</div>';
        }
        
        if (memory.tags && memory.tags.length > 0) {
            content += '<div class="popup-tags">';
            content += memory.tags.map(tag => '<span class="memory-tag">' + tag + '</span>').join('');
            content += '</div>';
        }
        
        return content;
    }

    renderMemoriesList() {
        const listContainer = document.getElementById('memories-list');
        listContainer.innerHTML = '';
        
        if (!this.currentTargetUser) {
            listContainer.innerHTML = '<p style="color: #6c757d; font-style: italic;">Please select a graduated member first.</p>';
            return;
        }
        
        const userMemories = this.dataManager.getMemoriesForUser(this.currentTargetUser);
        
        if (userMemories.length === 0) {
            listContainer.innerHTML = '<p style="color: #6c757d; font-style: italic;">No memories for this user yet.</p>';
            return;
        }

        userMemories.forEach(memory => {
            const item = document.createElement('div');
            item.className = 'memory-item';
            item.innerHTML = '<div class="memory-title">' + memory.title + '</div>' +
                            '<div class="member-name">By: ' + memory.contributorName + '</div>';
            
            if (memory.tags && memory.tags.length > 0) {
                item.innerHTML += '<div class="memory-tags">' +
                               memory.tags.map(tag => '<span class="memory-tag">' + tag + '</span>').join('') +
                               '</div>';
            }
            
            item.addEventListener('click', () => {
                this.map.flyTo({
                    center: memory.coordinates,
                    zoom: 15,
                    duration: 1000
                });
                
                // Find and trigger popup
                const userMarkers = this.markers.get(memory.targetUserId) || [];
                const markerData = userMarkers.find(m => m.memory.id === memory.id);
                if (markerData) {
                    markerData.marker.togglePopup();
                }
            });
            
            listContainer.appendChild(item);
        });
    }

    // Additional helper methods
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
            preview.innerHTML = '<img src="' + e.target.result + '" alt="Memory preview" style="max-width: 100%; max-height: 200px; border-radius: 4px; margin-top: 0.5rem;">';
        };
        reader.readAsDataURL(file);
        
        this.validateForm();
    }

    handleTrajectoryUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validExtensions = ['.gpx', '.json', '.geojson'];
        const fileName = file.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!isValid) {
            alert('Please select a valid trajectory file (GPX, JSON, or GeoJSON).');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                
                // Parse based on file type
                if (fileName.endsWith('.gpx')) {
                    // Parse GPX (XML format)
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(content, 'text/xml');
                    
                    // Extract coordinates from GPX
                    const trkpts = xmlDoc.getElementsByTagName('trkpt');
                    const coordinates = [];
                    for (let i = 0; i < trkpts.length; i++) {
                        const lat = parseFloat(trkpts[i].getAttribute('lat'));
                        const lon = parseFloat(trkpts[i].getAttribute('lon'));
                        coordinates.push([lon, lat]);
                    }
                    
                    this.currentTrajectoryData = {
                        type: 'LineString',
                        coordinates: coordinates,
                        format: 'gpx',
                        fileName: file.name
                    };
                    
                    console.log(`Parsed GPX trajectory with ${coordinates.length} points`);
                } else {
                    // Parse JSON/GeoJSON
                    const data = JSON.parse(content);
                    
                    // Handle different GeoJSON structures
                    if (data.type === 'FeatureCollection' && data.features && data.features.length > 0) {
                        this.currentTrajectoryData = data.features[0].geometry;
                    } else if (data.type === 'Feature') {
                        this.currentTrajectoryData = data.geometry;
                    } else if (data.type === 'LineString' || data.type === 'MultiLineString') {
                        this.currentTrajectoryData = data;
                    } else {
                        throw new Error('Unsupported GeoJSON format');
                    }
                    
                    this.currentTrajectoryData.format = 'geojson';
                    this.currentTrajectoryData.fileName = file.name;
                    
                    console.log(`Parsed GeoJSON trajectory: ${this.currentTrajectoryData.type}`);
                }
                
                // Show confirmation
                alert(`Trajectory file "${file.name}" loaded successfully!`);
                this.validateForm();
                
            } catch (error) {
                console.error('Error parsing trajectory file:', error);
                alert(`Failed to parse trajectory file: ${error.message}`);
                this.currentTrajectoryData = null;
            }
        };
        
        reader.readAsText(file);
    }

    async uploadImageToServer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64Data = e.target.result;
                    const extension = file.name.split('.').pop().toLowerCase();
                    
                    const response = await fetch('http://localhost:3001/api/upload/image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            data: base64Data,
                            extension: extension
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    resolve(result.path);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    async uploadTrajectoryToServer(trajectoryData, fileName) {
        try {
            const extension = fileName.split('.').pop().toLowerCase();
            
            const response = await fetch('http://localhost:3001/api/upload/trajectory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: trajectoryData,
                    extension: extension === 'gpx' ? 'json' : extension
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            return result.path;
        } catch (error) {
            console.error('Failed to upload trajectory:', error);
            throw error;
        }
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
        console.log('Adding memory marker at:', lngLat);
        
        // Reset marker mode
        this.toggleAddMarkerMode();
        
        // Store coordinates for the memory
        this.currentCoordinates = [lngLat.lng, lngLat.lat];
        console.log('currentCoordinates set to:', this.currentCoordinates);
        
        // Enable save button
        this.validateForm();
        
        // Show temporary marker
        if (this.tempMarker) {
            this.tempMarker.remove();
        }
        
        this.tempMarker = new mapboxgl.Marker({ color: '#28a745' })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(this.map);
            
        console.log('Temporary marker added to map');
    }

    validateForm() {
        const contributorName = document.getElementById('contributor-name').value.trim();
        const memoryTitle = document.getElementById('memory-title').value.trim();
        const memoryText = document.getElementById('memory-text').value.trim();
        
        const hasBasicInfo = contributorName && memoryTitle && memoryText;
        const hasLocation = this.currentCoordinates;
        const hasTargetUser = this.currentTargetUser;
        
        // Debug logging
        console.log('Form validation check:', {
            contributorName,
            memoryTitle,
            memoryText,
            hasBasicInfo,
            hasLocation,
            hasTargetUser,
            currentCoordinates: this.currentCoordinates,
            currentTargetUser: this.currentTargetUser
        });
        
        // Update location status display
        const locationStatus = document.getElementById('location-status');
        if (locationStatus) {
            if (hasLocation) {
                locationStatus.style.display = 'block';
                locationStatus.style.backgroundColor = '#d4edda';
                locationStatus.style.color = '#155724';
                locationStatus.textContent = `📍 Location selected: ${this.currentCoordinates[1].toFixed(4)}, ${this.currentCoordinates[0].toFixed(4)}`;
            } else {
                locationStatus.style.display = 'none';
            }
        }
        
        // Update target user status display
        const targetUserStatus = document.getElementById('target-user-status');
        if (targetUserStatus) {
            if (hasTargetUser) {
                const user = this.userManager.getUserById(this.currentTargetUser);
                targetUserStatus.style.backgroundColor = '#d4edda';
                targetUserStatus.style.color = '#155724';
                targetUserStatus.textContent = `🎯 Target: ${user ? user.name : this.currentTargetUser}`;
            } else {
                targetUserStatus.style.backgroundColor = '#f8d7da';
                targetUserStatus.style.color = '#721c24';
                targetUserStatus.textContent = '⚠️ Please select a graduated member from the list above';
            }
        }
        
        const saveBtn = document.getElementById('save-memory-btn');
        saveBtn.disabled = !(hasBasicInfo && hasLocation && hasTargetUser);
        
        if (!hasTargetUser) {
            saveBtn.title = 'Please select a graduated member first';
        } else if (!hasBasicInfo) {
            saveBtn.title = 'Please fill in contributor name, memory title, and description';
        } else if (!hasLocation) {
            saveBtn.title = 'Please add a location by clicking on the map';
        } else {
            saveBtn.title = 'Save this memory';
        }
        
        // Update button text to show validation status
        if (saveBtn.disabled) {
            if (!hasTargetUser) {
                saveBtn.textContent = '👤 Select Target User';
            } else if (!hasLocation) {
                saveBtn.textContent = '📍 Add Location';
            } else if (!hasBasicInfo) {
                saveBtn.textContent = '📝 Fill Required Fields';
            } else {
                saveBtn.textContent = '⚠️ Complete Required Fields';
            }
        } else {
            saveBtn.textContent = '💾 Save Memory';
        }
    }

    resetForm() {
        // Only clear contributor info if user is not logged in
        if (!this.currentRegisteredContributor) {
            document.getElementById('contributor-name').value = '';
            document.getElementById('contributor-email').value = '';
        }
        
        document.getElementById('memory-title').value = '';
        document.getElementById('memory-text').value = '';
        document.getElementById('memory-tags').value = '';
        document.getElementById('image-upload').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('save-memory-btn').disabled = true;
        document.getElementById('save-memory-btn').textContent = 'Save Memory';
        
        this.currentImageFile = null;
        this.currentCoordinates = null;
        
        if (this.tempMarker) {
            this.tempMarker.remove();
            this.tempMarker = null;
        }
        
        this.isAddingMarker = false;
        document.getElementById('add-marker-btn').textContent = 'Click Map to Add Location';
        
        // Re-validate form (will handle logged-in user state)
        this.validateForm();
    }

    clearAllMemoriesForCurrentUser() {
        if (!this.currentTargetUser) {
            alert('Please select a user first.');
            return;
        }
        
        const user = this.userManager.getUserById(this.currentTargetUser);
        const userName = user ? user.name : 'this user';
        
        if (confirm('Are you sure you want to clear all memories for ' + userName + '? This action cannot be undone.')) {
            // Get memories for current user
            const userMemories = this.dataManager.getMemoriesForUser(this.currentTargetUser);
            
            // Remove each memory
            userMemories.forEach(memory => {
                this.dataManager.deleteMemory(memory.id);
            });
            
            // Clear markers for this user
            const userMarkers = this.markers.get(this.currentTargetUser) || [];
            userMarkers.forEach(({ marker, memory }) => {
                marker.remove();
            });
            
            this.markers.delete(this.currentTargetUser);
            
            // Update UI
            this.renderMemoriesList();
            
            alert('All memories for ' + userName + ' cleared.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking dependencies...');
    
    if (typeof mapboxgl === 'undefined') {
        console.error('Mapbox GL JS failed to load. Please check your internet connection.');
        alert('Mapbox GL JS failed to load. Please check your internet connection.');
        return;
    }
    
    if (typeof DataManager === 'undefined') {
        console.error('DataManager class not found. Please check data-manager.js');
        alert('Data manager not loaded. Please check the console for errors.');
        return;
    }
    
    console.log('All dependencies loaded, initializing enhanced memory map...');
    
    try {
        window.enhancedMemoryMap = new EnhancedMemoryMap();
        await window.enhancedMemoryMap.init();
        console.log('Enhanced UAL M2 Memory Map initialized successfully');
    } catch (error) {
        console.error('Failed to initialize enhanced memory map:', error);
        alert('Failed to initialize the application. Please check the console for details.');
    }
});