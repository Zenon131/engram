import type { Engram } from '$lib/types/index.js';
import { supabase } from './supabase.js';

export const localStorageService = {
    
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
            if (!localStorageService.isAvailable()) {
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
            if (!localStorageService.isAvailable()) {
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
            const engrams = localStorageService.getEngrams();

            // Create a new engram with a unique ID
            const newEngram: Engram = {
                ...engramData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            
            // Create a new array instead of modifying the existing one
            const updatedEngrams = [...engrams, newEngram];

            // Save the updated array
            const saved = localStorageService.saveEngrams(updatedEngrams);
            
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
        const engrams = localStorageService.getEngrams();
        const updatedEngrams = engrams.filter(engram => engram.id !== id);
        localStorageService.saveEngrams(updatedEngrams);
    },
};

export const supabaseStorageService = {
    async getEngrams(): Promise<Engram[]> {
        const { data, error } = await supabase
            .from('engrams')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching engrams from Supabase:', error);
            return [];
        }

        return data || [];
    },

    async addEngram({ title, content }: Pick<Engram, 'title' | 'content'>): Promise<Engram | null> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      console.error('User not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('engrams')
      .insert({ 
        title, 
        content,
        user_id: user.user.id 
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding engram:', error);
      return null;
    }
    
    return data;
  },

    async deleteEngram(id: string): Promise<void> {
        const { error } = await supabase
            .from('engrams')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting engram:', error);
        }
    },
    
}