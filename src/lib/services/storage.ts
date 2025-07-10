import type { Engram } from '$lib/types/index.js';
import { supabase } from './supabase.js';
import { browser } from '$app/environment';

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

    addEngram: (engramData: Omit<Engram, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>): Engram | null => {
        try {
            // Get a fresh copy of the engrams
            const engrams = localStorageService.getEngrams();

            // Create a new engram with a unique ID
            const newEngram: Engram = {
                ...engramData,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                upvotes: 0,
                downvotes: 0,
                userVote: null
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
    
    voteEngram: (id: number, direction: 'up' | 'down'): Engram | null => {
        try {
            const engrams = localStorageService.getEngrams();
            const engramIndex = engrams.findIndex(engram => engram.id === id);
            
            if (engramIndex === -1) {
                return null;
            }
            
            const engram = engrams[engramIndex];
            const updatedEngram = { ...engram };
            
            // If user already voted the same way, remove their vote
            if (engram.userVote === direction) {
                if (direction === 'up') {
                    updatedEngram.upvotes -= 1;
                } else {
                    updatedEngram.downvotes -= 1;
                }
                updatedEngram.userVote = null;
            } 
            // If user voted the opposite way, switch their vote
            else if (engram.userVote !== null) {
                if (direction === 'up') {
                    updatedEngram.upvotes += 1;
                    updatedEngram.downvotes -= 1;
                } else {
                    updatedEngram.upvotes -= 1;
                    updatedEngram.downvotes += 1;
                }
                updatedEngram.userVote = direction;
            } 
            // If user hasn't voted yet, add their vote
            else {
                if (direction === 'up') {
                    updatedEngram.upvotes += 1;
                } else {
                    updatedEngram.downvotes += 1;
                }
                updatedEngram.userVote = direction;
            }
            
            // Update the engrams array
            const updatedEngrams = [...engrams];
            updatedEngrams[engramIndex] = updatedEngram;
            
            // Save the updated array
            const saved = localStorageService.saveEngrams(updatedEngrams);
            
            if (saved) {
                return updatedEngram;
            }
            
            return null;
        } catch (error) {
            console.error('Error voting on engram:', error);
            return null;
        }
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

    async addEngram({ title, content, cluster }: Pick<Engram, 'title' | 'content'> & { cluster?: string }): Promise<Engram | null> {
    // Get device ID for anonymous posting
    let deviceId = 'server';
    
    if (browser) {
      deviceId = localStorage.getItem('bulletin_device_id') || 
                'device_' + Math.random().toString(36).substring(2, 15);
      
      // Store the device ID if it's new
      if (!localStorage.getItem('bulletin_device_id')) {
        localStorage.setItem('bulletin_device_id', deviceId);
      }
    }
    
    const { data, error } = await supabase
      .from('engrams')
      .insert({ 
        title, 
        content,
        device_id: deviceId,
        cluster: cluster || 'general',
        upvotes: 0,
        downvotes: 0
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
    
    async voteEngram(id: string, direction: 'up' | 'down'): Promise<Engram | null> {
        // First get the current engram to check the user's current vote
        const { data: currentEngram, error: fetchError } = await supabase
            .from('engrams')
            .select('*')
            .eq('id', id)
            .single();
        
        if (fetchError || !currentEngram) {
            console.error('Error fetching engram for voting:', fetchError);
            return null;
        }
        
        // Get device ID for anonymous voting
        let deviceId = 'server';
        
        if (browser) {
          deviceId = localStorage.getItem('bulletin_device_id') || 
                    'device_' + Math.random().toString(36).substring(2, 15);
          
          // Store the device ID if it's new
          if (!localStorage.getItem('bulletin_device_id')) {
            localStorage.setItem('bulletin_device_id', deviceId);
          }
        }
        
        // Check if there's an existing vote record
        const { data: existingVote } = await supabase
            .from('votes')
            .select('*')
            .eq('engram_id', id)
            .eq('device_id', deviceId)
            .single();
        
        let updateFields = {};
        
        // Handle the different vote scenarios
        if (!existingVote) {
            // No previous vote, add a new one
            await supabase.from('votes').insert({
                engram_id: id,
                device_id: deviceId,
                vote_type: direction
            });
            
            // Update the vote count
            updateFields = direction === 'up' 
                ? { upvotes: currentEngram.upvotes + 1 }
                : { downvotes: currentEngram.downvotes + 1 };
        } else if (existingVote.vote_type === direction) {
            // Same vote direction, remove the vote
            await supabase.from('votes')
                .delete()
                .eq('engram_id', id)
                .eq('device_id', deviceId);
                
            // Update the vote count
            updateFields = direction === 'up'
                ? { upvotes: Math.max(0, currentEngram.upvotes - 1) }
                : { downvotes: Math.max(0, currentEngram.downvotes - 1) };
        } else {
            // Different vote direction, change the vote
            await supabase.from('votes')
                .update({ vote_type: direction })
                .eq('engram_id', id)
                .eq('device_id', deviceId);
                
            // Update the vote count
            updateFields = direction === 'up'
                ? { 
                    upvotes: currentEngram.upvotes + 1,
                    downvotes: Math.max(0, currentEngram.downvotes - 1)
                }
                : {
                    upvotes: Math.max(0, currentEngram.upvotes - 1),
                    downvotes: currentEngram.downvotes + 1
                };
        }
        
        // Update the engram with new vote counts
        const { data: updatedEngram, error: updateError } = await supabase
            .from('engrams')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single();
            
        if (updateError) {
            console.error('Error updating engram votes:', updateError);
            return null;
        }
        
        // Add userVote to the returned data
        return {
            ...updatedEngram,
            userVote: direction
        };
    }
}