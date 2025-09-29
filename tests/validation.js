// Simple validation tests for the Memory Map application
// Run these in the browser console after loading the page

console.log('Running UAL M2 Memory Map validation tests...');

// Test 1: Check if core elements exist
function testElementsExist() {
    const elements = [
        'member-name',
        'memory-title', 
        'memory-text',
        'image-upload',
        'trajectory-upload',
        'add-marker-btn',
        'save-memory-btn',
        'memories-list',
        'map'
    ];
    
    let allFound = true;
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Element '${id}' not found`);
            allFound = false;
        }
    });
    
    if (allFound) {
        console.log('✅ All required DOM elements found');
    }
    return allFound;
}

// Test 2: Check if Mapbox is loaded
function testMapboxLoaded() {
    if (typeof mapboxgl !== 'undefined') {
        console.log('✅ Mapbox GL JS loaded successfully');
        return true;
    } else {
        console.error('❌ Mapbox GL JS not loaded');
        return false;
    }
}

// Test 3: Check if MemoryMap class is instantiated
function testMemoryMapClass() {
    if (window.memoryMap && window.memoryMap instanceof MemoryMap) {
        console.log('✅ MemoryMap class instantiated');
        return true;
    } else {
        console.error('❌ MemoryMap class not instantiated');
        return false;
    }
}

// Test 4: Check localStorage functionality
function testLocalStorage() {
    try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        
        if (value === 'value') {
            console.log('✅ LocalStorage working correctly');
            return true;
        }
    } catch (e) {
        console.error('❌ LocalStorage not available:', e);
        return false;
    }
}

// Test 5: Check form validation
function testFormValidation() {
    if (window.memoryMap && typeof window.memoryMap.validateForm === 'function') {
        console.log('✅ Form validation method available');
        return true;
    } else {
        console.error('❌ Form validation method not available');
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('\n=== UAL M2 Memory Map Validation Tests ===\n');
    
    const tests = [
        { name: 'DOM Elements', fn: testElementsExist },
        { name: 'Mapbox Loading', fn: testMapboxLoaded },
        { name: 'MemoryMap Class', fn: testMemoryMapClass },
        { name: 'LocalStorage', fn: testLocalStorage },
        { name: 'Form Validation', fn: testFormValidation }
    ];
    
    let passed = 0;
    tests.forEach((test, index) => {
        console.log(`Test ${index + 1}: ${test.name}`);
        if (test.fn()) {
            passed++;
        }
        console.log('');
    });
    
    console.log(`\n=== Results: ${passed}/${tests.length} tests passed ===`);
    
    if (passed === tests.length) {
        console.log('🎉 All tests passed! The application is ready to use.');
        console.log('\nTo test the functionality:');
        console.log('1. Fill in the form fields');
        console.log('2. Click "Click Map to Add Location"');
        console.log('3. Click anywhere on the map');
        console.log('4. Click "Save Memory"');
        console.log('5. Watch your memory appear on the map!');
    } else {
        console.log('⚠️ Some tests failed. Check the console for details.');
    }
}

// Auto-run tests when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 1000); // Wait for app initialization
    });
} else {
    setTimeout(runAllTests, 1000);
}