import type { Engram } from '$lib/types/index.js';

export const storageService = {
    
    isAvailable: (): boolean => {
        try {
            // Check if window exists (browser environment)
            if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
                return false;
            }
            
            // Test if localStorage can be written to
            const testKey = '__test_storage__';
            localStorage.setItem(testKey, testKey);
            const testValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            return testValue === testKey;
        } catch (e) {
            console.error('Error checking localStorage availability:', e);
            return false;
        }
    },

    getEngrams: (): Engram[] => {
        try {
            if (!storageService.isAvailable()) {
                return [];
            } else {
                const storedData = localStorage.getItem('engrams');
                const engrams = storedData ? JSON.parse(storedData) : [];
                return engrams;
            }
        } catch (error) {
            console.error('Error retrieving engrams:', error);
            return [];
        }
    },

    saveEngrams: (engrams: Engram[]): boolean => {
        try {
            if (!storageService.isAvailable()) {
                return false;
            } else {
                localStorage.setItem('engrams', JSON.stringify(engrams));
                return true;
            }
        } catch (error) {
            console.error('Error saving engrams:', error);
            return false;
        }
    },

    addEngram: (engramData: Omit<Engram, 'id' | 'createdAt'>): Engram | null => {
        try {
            // Get a fresh copy of the engrams
            const engrams = storageService.getEngrams();

            // Create a new engram with a unique ID
            const newEngram: Engram = {
                ...engramData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            
            // Create a new array instead of modifying the existing one
            const updatedEngrams = [...engrams, newEngram];

            // Save the updated array
            const saved = storageService.saveEngrams(updatedEngrams);
            
            if (saved) {
                return newEngram;
            }

            return null;
        } catch (error) {
            console.error('Error adding engram:', error);
            return null;
        }
    },

    deleteEngram: (id: number): void => {
        const engrams = storageService.getEngrams();
        const updatedEngrams = engrams.filter(engram => engram.id !== id);
        storageService.saveEngrams(updatedEngrams);
    },
};