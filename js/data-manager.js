/**
 * UAL M2 - Data Manager
 * Handles user registration, contributor data, and color assignments
 */

class DataManager {
    constructor() {
        this.users = new Map();
        this.currentTargetUser = null;
        this.registeredContributors = new Map();
        this.contributorColors = new Map();
        this.nextColorIndex = 0;
        this.availableColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        
        this.loadContributorsFromStorage();
        this.loadColorAssignments();
    }

    loadSampleUsers() {
        const sampleUsers = {
            "user001": {
                "id": "user001",
                "name": "Dr. Binyu Lei",
                "email": "binyu.lei@nus.edu.sg",
                "role": "graduated_member",
                "isActive": true,
                "graduationDate": "2025-10-31",
                "department": "Urban Analytics Lab",
                "biography": "Former PhD student specializing in urban digintal twins",
                "memoriesReceived": [],
                "memoriesContributed": []
            },
            "user002": {
                "id": "user002", 
                "name": "Dr. Winston Yap",
                "email": "winston.yap@nus.edu.sg",
                "role": "graduated_member",
                "isActive": true,
                "graduationDate": "2025-10-31",
                "department": "Urban Analytics Lab",
                "biography": "Former Research Fellow in urban graph",
                "memoriesReceived": [],
                "memoriesContributed": []
            }
        };

        Object.values(sampleUsers).forEach(user => {
            this.users.set(user.id, user);
        });

        return sampleUsers;
    }

    getGraduatedMembers() {
        return Array.from(this.users.values()).filter(user => user.role === 'graduated_member');
    }

    getCurrentMembers() {
        return Array.from(this.users.values()).filter(user => user.role === 'current_member');
    }

    getUserById(id) {
        return this.users.get(id);
    }

    setCurrentTargetUser(userId) {
        this.currentTargetUser = userId;
    }

    getCurrentTargetUser() {
        return this.currentTargetUser;
    }

    // Contributor registration methods
    async registerContributor(contributorData) {
        try {
            // Assign color if not already assigned
            if (!this.contributorColors.has(contributorData.email)) {
                this.assignColor(contributorData.email);
            }

            // Add contributor data
            const contributor = {
                ...contributorData,
                id: contributorData.email,
                registrationDate: new Date().toISOString(),
                color: this.contributorColors.get(contributorData.email)
            };

            this.registeredContributors.set(contributorData.email, contributor);
            
            // Save to storage
            await this.saveContributorsToStorage();
            this.saveColorAssignments();

            console.log('Contributor registered successfully:', contributor);
            return contributor;
        } catch (error) {
            console.error('Error registering contributor:', error);
            throw error;
        }
    }

    assignColor(contributorId) {
        if (!this.contributorColors.has(contributorId)) {
            const color = this.availableColors[this.nextColorIndex % this.availableColors.length];
            this.contributorColors.set(contributorId, color);
            this.nextColorIndex++;
            
            console.log(`Assigned color ${color} to contributor ${contributorId}`);
        }
        return this.contributorColors.get(contributorId);
    }

    getContributorColor(contributorId) {
        return this.contributorColors.get(contributorId) || '#666666';
    }

    getAllContributors() {
        return Array.from(this.registeredContributors.values());
    }

    // Additional methods needed by enhanced-memory-map.js
    async loadUsers() {
        // Load sample users and contributors
        this.loadSampleUsers();
        await this.loadContributorsFromStorage();
    }

    getContributorByEmail(email) {
        return this.registeredContributors.get(email);
    }

    async saveContributorsToStorage() {
        try {
            const contributorsData = Object.fromEntries(this.registeredContributors);
            
            // Try to save to server first
            try {
                const response = await fetch('http://localhost:3001/api/users/save-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contributorsData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Successfully saved contributors to server:', result.message);
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
                
            } catch (serverError) {
                console.warn('Server save failed, using localStorage:', serverError.message);
            }
            
            // Always save to localStorage as backup
            localStorage.setItem('ual_m2_contributors', JSON.stringify(contributorsData));
            
        } catch (error) {
            console.error('Error saving contributors to storage:', error);
        }
    }

    async loadContributorsFromStorage() {
        try {
            // First try to load from server with timeout
            try {
                console.log('Attempting to load contributors from server...');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
                
                const response = await fetch('http://localhost:3001/api/users/list', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const contributorsData = await response.json();
                    Object.entries(contributorsData).forEach(([id, contributor]) => {
                        this.registeredContributors.set(id, contributor);
                    });
                    console.log('✅ Loaded contributors from server:', Object.keys(contributorsData).length);
                    return;
                } else {
                    console.warn('Server response not ok:', response.status);
                }
            } catch (serverError) {
                console.warn('⚠️ Server not available, using localStorage fallback:', serverError.message);
            }
            
            // Fallback to localStorage
            const data = localStorage.getItem('ual_m2_contributors');
            if (data) {
                const parsed = JSON.parse(data);
                Object.entries(parsed).forEach(([id, contributor]) => {
                    this.registeredContributors.set(id, contributor);
                });
                console.log('✅ Loaded contributors from localStorage:', Object.keys(parsed).length);
            } else {
                console.log('📝 No existing contributors found in storage');
            }
        } catch (error) {
            console.error('❌ Error loading contributors from storage:', error);
        }
    }

    async saveColorAssignments() {
        try {
            const colorData = Object.fromEntries(this.contributorColors);
            
            // Save to localStorage as backup
            localStorage.setItem('ual_m2_contributor_colors', JSON.stringify(colorData));
            localStorage.setItem('ual_m2_next_color_index', this.nextColorIndex.toString());
            
            // Try to save color assignments to server (individual files would handle this)
            console.log('Color assignments saved to localStorage');
            
        } catch (error) {
            console.error('Error saving color assignments:', error);
        }
    }

    loadColorAssignments() {
        try {
            const colorData = localStorage.getItem('ual_m2_contributor_colors');
            const nextColorIndexData = localStorage.getItem('ual_m2_next_color_index');
            
            if (colorData) {
                const parsed = JSON.parse(colorData);
                Object.entries(parsed).forEach(([id, color]) => {
                    this.contributorColors.set(id, color);
                });
                console.log('Loaded contributor colors from localStorage');
            }
            
            if (nextColorIndexData) {
                this.nextColorIndex = parseInt(nextColorIndexData);
                console.log('Loaded next color index from localStorage:', this.nextColorIndex);
            }
        } catch (error) {
            console.error('Error loading color assignments:', error);
        }
    }
}

class MemoryDataManager {
    constructor() {
        this.memories = new Map();
        this.currentUser = null;
        this.loadMemoriesFromStorage();
    }

    async addMemory(memoryData) {
        console.log('📝 MemoryDataManager.addMemory called with:', memoryData);
        
        const memory = {
            id: Date.now().toString(),
            ...memoryData,
            timestamp: new Date().toISOString()
        };
        
        console.log('💾 Created memory object with ID:', memory.id);
        this.memories.set(memory.id, memory);
        console.log(`📊 Total memories in map: ${this.memories.size}`);
        
        console.log('💿 Saving memories to storage...');
        await this.saveMemoriesToStorage();
        console.log('✅ Memory added and saved successfully');
        
        return memory;
    }

    getMemoriesForUser(userId) {
        return Array.from(this.memories.values())
            .filter(memory => memory.targetUserId === userId);
    }

    getAllMemories() {
        return Array.from(this.memories.values());
    }

    deleteMemory(memoryId) {
        return this.memories.delete(memoryId);
    }

    setCurrentUser(userId) {
        this.currentUser = userId;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Alias for loadMemoriesFromStorage to match enhanced-memory-map.js expectations
    async loadMemories() {
        await this.loadMemoriesFromStorage();
    }

    // Alias for addMemory to match enhanced-memory-map.js expectations
    async saveMemory(memoryData) {
        console.log('🔄 MemoryDataManager.saveMemory called, delegating to addMemory...');
        const memory = await this.addMemory(memoryData);
        console.log('✅ saveMemory completed, returning ID:', memory.id);
        return memory.id;
    }

    async saveMemoriesToStorage() {
        try {
            const memoriesData = Object.fromEntries(this.memories);
            
            // Try to save to server first
            try {
                const response = await fetch('http://localhost:3001/api/memories/save-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(memoriesData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Successfully saved memories to server:', result.message);
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
                
            } catch (serverError) {
                console.warn('Server save failed, using localStorage:', serverError.message);
            }
            
            // Always save to localStorage as backup
            localStorage.setItem('ual_m2_memories', JSON.stringify(memoriesData));
            
        } catch (error) {
            console.error('Error saving memories to storage:', error);
        }
    }

    async loadMemoriesFromStorage() {
        try {
            // First try to load from server with timeout
            try {
                console.log('Attempting to load memories from server...');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
                
                const response = await fetch('http://localhost:3001/api/memories/list', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const memoriesData = await response.json();
                    Object.entries(memoriesData).forEach(([id, memory]) => {
                        this.memories.set(id, memory);
                    });
                    console.log('✅ Loaded memories from server:', Object.keys(memoriesData).length);
                    return;
                } else {
                    console.warn('Server response not ok:', response.status);
                }
            } catch (serverError) {
                console.warn('⚠️ Server not available, using localStorage fallback:', serverError.message);
            }
            
            // Fallback to localStorage
            const data = localStorage.getItem('ual_m2_memories');
            if (data) {
                const parsed = JSON.parse(data);
                Object.entries(parsed).forEach(([id, memory]) => {
                    this.memories.set(id, memory);
                });
                console.log('✅ Loaded memories from localStorage:', Object.keys(parsed).length);
            } else {
                console.log('📝 No existing memories found in storage');
            }
        } catch (error) {
            console.error('❌ Error loading memories from storage:', error);
        }
    }

    async deleteMemory(memoryId) {
        const result = this.memories.delete(memoryId);
        if (result) {
            await this.saveMemoriesToStorage();
        }
        return result;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager, MemoryDataManager };
}