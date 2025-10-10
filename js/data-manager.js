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
        
        // 高对比度颜色调色板 - 48种优化颜色，确保最大视觉差异
        this.availableColors = [
            "#f43d3d", "#b2e5df", "#c1380a", "#b2e5d8", "#f43daf", "#329966", "#f9a99e", "#658ccc",
            "#ad891e", "#b2b2e5", "#66c10a", "#e5b2df", "#4fc10a", "#e6a8ef", "#32993f", "#d79ef9",
            "#7f9932", "#983df4", "#659932", "#e5b2c1", "#99e532", "#f99ed7", "#8899e5", "#f4d73d",
            "#32c166", "#f93dd7", "#32e599", "#d7733d", "#0a99c1", "#f9d79e", "#e5323f", "#9ef9c1",
            "#7fc133", "#e599b2", "#66e532", "#b299e5", "#99b232", "#cc8865", "#329932", "#f4a83d",
            "#65b2cc", "#e532c1", "#b2e532", "#d79ec1", "#66cc32", "#e5c1b2", "#99cc65", "#f47f3d"
        ];
        
        console.log(`🎨 颜色系统初始化完成，共 ${this.availableColors.length} 种高对比度颜色`);
        
        this.loadContributorsFromStorage();
        this.loadColorAssignments();
    }

    loadSampleUsers() {
        const sampleUsers = {
            "user001": {
                "id": "user001",
                "name": "Binyu Lei",
                "email": "binyul@u.nus.edu",
                "role": "graduated_member",
                "isActive": true,
                "graduationDate": "2025-10-31",
                "department": "Urban Analytics Lab",
                "biography": "PhD in urban digital twins",
                "memoriesReceived": [],
                "memoriesContributed": []
            },
            "user002": {
                "id": "user002", 
                "name": "Winston Yap",
                "email": "winstonyym@u.nus.edu",
                "role": "graduated_member",
                "isActive": true,
                "graduationDate": "2025-10-31",
                "department": "Urban Analytics Lab",
                "biography": "PhD in urban graph",
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
        // 优先检查是否已经有存储的颜色（从用户文件中加载）
        if (this.contributorColors.has(contributorId)) {
            const existingColor = this.contributorColors.get(contributorId);
            console.log(`🎨 使用已存储的颜色: ${contributorId} → ${existingColor}`);
            return existingColor;
        }
        
        // 只有当用户没有存储颜色时才分配新颜色
        let selectedColor;
        
        // 如果是第一个用户，直接分配第一个颜色
        if (this.contributorColors.size === 0) {
            selectedColor = this.availableColors[0];
            this.nextColorIndex = 1;
        } else {
            // 智能颜色分配：选择与已分配颜色差异最大的颜色
            selectedColor = this.selectOptimalColor();
        }
        
        this.contributorColors.set(contributorId, selectedColor);
        console.log(`🎨 为新用户分配颜色: ${contributorId} → ${selectedColor} (总计: ${this.contributorColors.size}/${this.availableColors.length})`);
        
        return selectedColor;
    }

    selectOptimalColor() {
        // 获取所有已分配的颜色
        const assignedColors = Array.from(this.contributorColors.values());
        
        if (assignedColors.length >= this.availableColors.length) {
            // 如果所有颜色都已分配，回到循环分配
            const color = this.availableColors[this.nextColorIndex % this.availableColors.length];
            this.nextColorIndex++;
            return color;
        }
        
        // 计算每个未分配颜色与已分配颜色的最小距离
        let bestColor = null;
        let maxMinDistance = -1;
        
        for (const candidateColor of this.availableColors) {
            if (assignedColors.includes(candidateColor)) {
                continue; // 跳过已分配的颜色
            }
            
            // 计算这个候选颜色与所有已分配颜色的最小距离
            let minDistance = Infinity;
            for (const assignedColor of assignedColors) {
                const distance = this.calculateColorDistance(candidateColor, assignedColor);
                minDistance = Math.min(minDistance, distance);
            }
            
            // 选择最小距离最大的颜色（即与所有已分配颜色都相对较远的颜色）
            if (minDistance > maxMinDistance) {
                maxMinDistance = minDistance;
                bestColor = candidateColor;
            }
        }
        
        return bestColor || this.availableColors[this.nextColorIndex % this.availableColors.length];
    }

    calculateColorDistance(color1, color2) {
        // 简化的RGB颜色距离计算
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 0;
        
        // 欧几里得距离
        const rDiff = rgb1.r - rgb2.r;
        const gDiff = rgb1.g - rgb2.g;
        const bDiff = rgb1.b - rgb2.b;
        
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
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
            console.log('Loading contributors from server...');
            const response = await fetch('http://localhost:3001/api/users/list', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const contributorsData = await response.json();
                Object.entries(contributorsData).forEach(([id, contributor]) => {
                    this.registeredContributors.set(id, contributor);
                    
                    // 🎨 从用户文件中加载已存储的颜色，确保颜色持久性
                    if (contributor.color) {
                        this.contributorColors.set(id, contributor.color);
                        console.log(`🎨 从用户文件加载颜色: ${id} → ${contributor.color}`);
                    }
                });
                console.log('✅ Loaded contributors from server:', Object.keys(contributorsData).length);
                console.log(`🎨 加载了 ${this.contributorColors.size} 个用户的持久颜色分配`);
            } else {
                throw new Error(`Server response error: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading contributors from storage:', error);
        }
    }

    async updateContributionCounts() {
        try {
            console.log('🔄 Updating contribution counts from latest memories...');
            
            // Get all memories from server
            const response = await fetch('http://localhost:3001/api/memories/list', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch memories: ${response.status}`);
            }
            
            const memoriesData = await response.json();
            
            // Count contributions per contributor email
            const contributionCounts = new Map();
            Object.values(memoriesData).forEach(memory => {
                const email = memory.contributorEmail || memory.registeredContributorId;
                if (email) {
                    const currentCount = contributionCounts.get(email) || 0;
                    contributionCounts.set(email, currentCount + 1);
                }
            });
            
            // Update contributor data with actual counts
            let updatedContributors = 0;
            for (const [email, contributor] of this.registeredContributors) {
                const actualCount = contributionCounts.get(email) || 0;
                const currentCount = contributor.memoriesContributed?.length || 0;
                
                if (actualCount !== currentCount) {
                    // Create array of memory IDs for this contributor
                    const contributorMemories = Object.values(memoriesData)
                        .filter(memory => 
                            memory.contributorEmail === email || 
                            memory.registeredContributorId === email
                        )
                        .map(memory => memory.id);
                    
                    contributor.memoriesContributed = contributorMemories;
                    updatedContributors++;
                    
                    console.log(`📊 Updated ${email}: ${currentCount} → ${actualCount} contributions`);
                }
            }
            
            if (updatedContributors > 0) {
                // Save updated contributor data
                await this.saveContributorsToStorage();
                console.log(`✅ Updated contribution counts for ${updatedContributors} contributors`);
            } else {
                console.log('✅ All contribution counts are up to date');
            }
            
        } catch (error) {
            console.error('❌ Error updating contribution counts:', error);
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
        // 🎨 颜色分配现在主要从用户文件中加载，localStorage仅作为临时缓存
        try {
            const colorData = localStorage.getItem('ual_m2_contributor_colors');
            const nextColorIndexData = localStorage.getItem('ual_m2_next_color_index');
            
            if (colorData) {
                const parsed = JSON.parse(colorData);
                // 只加载那些还没有从用户文件中加载的颜色
                Object.entries(parsed).forEach(([id, color]) => {
                    if (!this.contributorColors.has(id)) {
                        this.contributorColors.set(id, color);
                    }
                });
                console.log('📱 从localStorage加载补充颜色分配');
            }
            
            if (nextColorIndexData) {
                this.nextColorIndex = parseInt(nextColorIndexData);
                console.log('📱 从localStorage加载颜色索引:', this.nextColorIndex);
            }
            
            console.log(`🎨 颜色分配系统就绪，当前已分配: ${this.contributorColors.size} 个用户`);
        } catch (error) {
            console.error('Error loading color assignments from localStorage:', error);
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
            
            // Save to server
            const response = await fetch('http://localhost:3001/api/memories/save-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memoriesData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Successfully saved memories to server:', result.message);
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error saving memories to server:', error);
            throw error;
        }
    }

    async loadMemoriesFromStorage() {
        try {
            console.log('Loading memories from server...');
            const response = await fetch('http://localhost:3001/api/memories/list', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const memoriesData = await response.json();
                Object.entries(memoriesData).forEach(([id, memory]) => {
                    this.memories.set(id, memory);
                });
                console.log('✅ Loaded memories from server:', Object.keys(memoriesData).length);
            } else {
                throw new Error(`Server response error: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading memories from server:', error);
            throw error;
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